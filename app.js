// Data structure: {id, name, status, created}
const STORAGE_KEY = 'jobTracker.tasks.v1';
const companyInput = document.getElementById('companyInput');
const statusInput = document.getElementById('statusInput');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const listBody = document.getElementById('listBody');
const emptyEl = document.getElementById('empty');

let tasks = load();
render();

addBtn.addEventListener('click', ()=>{
  const name = companyInput.value.trim();
  const status = statusInput.value;
  if(!name) { companyInput.focus(); return; }
  tasks.push({id: Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6), name, status, created: Date.now()});
  save(); render(); companyInput.value=''; companyInput.focus();
});

clearBtn.addEventListener('click', ()=>{
  if(!confirm('Clear all entries?')) return;
  tasks = []; save(); render();
});

companyInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ addBtn.click(); } });

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function load(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }catch(e){ return []; } }

function render(){
  listBody.innerHTML='';
  if(tasks.length === 0){ emptyEl.style.display='block'; return; } else { emptyEl.style.display='none'; }

  tasks.forEach(task => {
    const tr = document.createElement('tr');

    // Company cell (editable)
    const tdName = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type='text'; nameInput.value = task.name; nameInput.style.width='100%'; nameInput.style.background='transparent'; nameInput.style.border='0'; nameInput.style.color='inherit';
    nameInput.addEventListener('change', ()=>{ task.name = nameInput.value.trim() || task.name; save(); render(); });
    tdName.appendChild(nameInput);

    // Status cell (dropdown)
    const tdStatus = document.createElement('td');
    const select = document.createElement('select'); select.className='status-select';
    const opts = [ ['applied','Applied'], ['oa','Online assessment done'], ['interview','Interview done'], ['selected','Selected'] ];
    opts.forEach(o=>{ const opt = document.createElement('option'); opt.value=o[0]; opt.textContent=o[1]; if(o[0]===task.status) opt.selected=true; select.appendChild(opt); });
    select.addEventListener('change', ()=>{ task.status = select.value; save(); render(); });
    tdStatus.appendChild(select);

    // Actions cell
    const tdActions = document.createElement('td'); tdActions.className='actions';
    const delBtn = document.createElement('button'); delBtn.title='Delete'; delBtn.innerHTML='🗑'; delBtn.addEventListener('click', ()=>{ if(confirm('Delete this entry?')){ tasks = tasks.filter(t=>t.id!==task.id); save(); render(); } });
    const upBtn = document.createElement('button'); upBtn.title='Move up'; upBtn.innerHTML='⬆️'; upBtn.addEventListener('click', ()=>{ move(task.id, -1); });
    const downBtn = document.createElement('button'); downBtn.title='Move down'; downBtn.innerHTML='⬇️'; downBtn.addEventListener('click', ()=>{ move(task.id, 1); });
    tdActions.appendChild(upBtn); tdActions.appendChild(downBtn); tdActions.appendChild(delBtn);

    tr.appendChild(tdName); tr.appendChild(tdStatus); tr.appendChild(tdActions);
    listBody.appendChild(tr);
  });
}

function move(id, dir){ const idx = tasks.findIndex(t=>t.id===id); if(idx===-1) return; const newIdx = idx+dir; if(newIdx<0||newIdx>=tasks.length) return; const tmp = tasks[newIdx]; tasks[newIdx] = tasks[idx]; tasks[idx] = tmp; save(); render(); }

// small helper: show friendly pill for status if needed (not used in table but kept for extensibility)
function statusPill(status){
  const span = document.createElement('span');
  span.className = 'pill ' + (status === 'applied' ? 'applied' : status === 'oa' ? 'oa' : status === 'interview' ? 'interview' : 'selected');
  span.textContent = (status === 'applied') ? 'Applied' : (status === 'oa') ? 'Online assessment' : (status === 'interview') ? 'Interview' : 'Selected';
  return span;
}

// Expose for debugging in console
window.jobTracker = {get tasks(){return tasks}, save, load};
