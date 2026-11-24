const STORAGE_KEY = "csd0111_student_records_v1";
const $ = (id) => document.getElementById(id);
let students = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function saveToStorage(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); }
function showMessage(message, color){ $("formMessage").textContent=message; $("formMessage").style.color=color||"#16865b"; }
function clearForm(){
  $("studentForm").reset(); $("editId").value=""; $("formTitle").textContent="Add New Student";
  $("saveBtn").textContent="＋ Add Student"; showMessage("");
}
function render(){
  const q=$("searchInput").value.trim().toLowerCase();
  const filtered=students.filter(s=>s.name.toLowerCase().includes(q)||s.roll.toLowerCase().includes(q));
  $("studentRows").innerHTML=filtered.map(s=>`
    <tr><td>${escapeHTML(s.roll)}</td><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.course)}</td>
    <td>${escapeHTML(s.year)}</td><td>${escapeHTML(s.email)}</td><td>${s.marks}%</td>
    <td><span class="status ${s.marks>=35?'pass':'fail'}">${s.marks>=35?'Pass':'Needs Support'}</span></td>
    <td><button class="action" data-edit="${s.id}">Edit</button><button class="action delete" data-delete="${s.id}">Delete</button></td></tr>`).join("");
  $("emptyState").style.display=filtered.length?"none":"block";
  $("totalCount").textContent=students.length;
  $("averageMarks").textContent=students.length?(students.reduce((a,s)=>a+s.marks,0)/students.length).toFixed(1)+"%":"0%";
  $("passedCount").textContent=students.filter(s=>s.marks>=35).length;
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("studentForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("editId").value;
  const record={id:id||String(Date.now()),name:$("name").value.trim(),roll:$("roll").value.trim(),course:$("course").value.trim(),year:$("year").value,email:$("email").value.trim(),marks:Number($("marks").value)};
  if(!record.name||!record.roll||!record.course||!record.year||!record.email||!Number.isFinite(record.marks)||record.marks<0||record.marks>100){showMessage("Please enter valid details.","#c44747");return;}
  const duplicate=students.some(s=>s.roll.toLowerCase()===record.roll.toLowerCase()&&s.id!==id);
  if(duplicate){showMessage("This roll number already exists.","#c44747");return;}
  if(id){students=students.map(s=>s.id===id?record:s);showMessage("Student record updated successfully.");}
  else{students.push(record);showMessage("Student added successfully.");}
  saveToStorage();render();clearForm();
});
$("studentRows").addEventListener("click",e=>{
  const edit=e.target.dataset.edit, del=e.target.dataset.delete;
  if(edit){
    const s=students.find(x=>x.id===edit); if(!s)return;
    $("editId").value=s.id;$("name").value=s.name;$("roll").value=s.roll;$("course").value=s.course;
    $("year").value=s.year;$("email").value=s.email;$("marks").value=s.marks;
    $("formTitle").textContent="Update Student";$("saveBtn").textContent="Save Changes";
    window.scrollTo({top:0,behavior:"smooth"});
  }
  if(del&&confirm("Delete this student record?")){
    students=students.filter(s=>s.id!==del);saveToStorage();render();showMessage("Record deleted.");
  }
});
$("searchInput").addEventListener("input",render);
$("resetBtn").addEventListener("click",clearForm);
$("exportBtn").addEventListener("click",()=>{
  if(!students.length){alert("There are no records to export.");return;}
  const cols=["roll","name","course","year","email","marks"];
  const csv=[cols.join(","),...students.map(s=>cols.map(k=>'"'+String(s[k]).replace(/"/g,'""')+'"').join(","))].join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="student_records.csv";a.click();URL.revokeObjectURL(url);
});
render();