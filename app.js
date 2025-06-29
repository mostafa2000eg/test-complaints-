// ========== البيانات الرئيسية ==========
let customers = JSON.parse(localStorage.getItem("customers") || "[]");

function saveCustomers() {
    localStorage.setItem("customers", JSON.stringify(customers));
}

// ========== الواجهة الرئيسية ==========

function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>نظام الشكاوى والمراسلات</h1>
        <button onclick="showAddCustomerForm()">إضافة عميل جديد</button>
        <input id="search" placeholder="بحث عن عميل بالاسم أو الرقم..." oninput="showCustomerList()" style="width:60%;margin:10px 0 18px;">
        <div id="customer-list"></div>
    `;
    showCustomerList();
}
window.render = render;

function showCustomerList() {
    let q = document.getElementById("search").value.trim();
    let html = "";
    customers.filter(c=>!q || c.name.includes(q) || c.id.includes(q)).forEach((c, idx) => {
        html += `<div class="customer-row" onclick="showCustomerDetails(${idx})">
            <span>
                <b>${c.name}</b> (${c.id})<br>
                <small>${c.address}</small>
            </span>
            <span>
                <button class="secondary" onclick="event.stopPropagation();deleteCustomer(${idx})">حذف</button>
            </span>
        </div>`;
    });
    document.getElementById("customer-list").innerHTML = html || "<i>لا يوجد عملاء.</i>";
}
window.showCustomerList = showCustomerList;

// ========== إضافة عميل جديد ==========
function showAddCustomerForm() {
    document.getElementById("app").innerHTML = `
        <h2>إضافة عميل جديد</h2>
        <label>رقم المشترك</label>
        <input id="cid" placeholder="مثال: 01091818010100">
        <label>الاسم</label>
        <input id="cname">
        <label>العنوان</label>
        <input id="caddr">
        <label>رقم التليفون</label>
        <input id="cphone">
        <label>ملاحظات</label>
        <textarea id="cnotes"></textarea>
        <br>
        <button onclick="addCustomer()">حفظ</button>
        <button class="secondary" onclick="render()">إلغاء</button>
    `;
}
window.showAddCustomerForm = showAddCustomerForm;

function addCustomer() {
    let c = {
        id: document.getElementById("cid").value,
        name: document.getElementById("cname").value,
        address: document.getElementById("caddr").value,
        phone: document.getElementById("cphone").value,
        notes: document.getElementById("cnotes").value,
        correspondences: []
    };
    if (!c.id || !c.name) {
        alert("أدخل رقم المشترك واسم العميل.");
        return;
    }
    customers.push(c);
    saveCustomers();
    render();
}
window.addCustomer = addCustomer;

function deleteCustomer(idx) {
    if (confirm("هل أنت متأكد من حذف هذا العميل وكل مراسلاته؟")) {
        customers.splice(idx,1);
        saveCustomers();
        render();
    }
}
window.deleteCustomer = deleteCustomer;

// ========== تفاصيل العميل ==========
function showCustomerDetails(idx) {
    let c = customers[idx];
    document.getElementById("app").innerHTML = `
        <button onclick="render()" class="secondary">رجوع</button>
        <h2>${c.name} <span style="font-size:0.7em;color:#666">(${c.id})</span></h2>
        <div>العنوان: ${c.address}</div>
        <div>تليفون: ${c.phone}</div>
        <div>ملاحظات: ${c.notes || ''}</div>
        <hr>
        <button onclick="showAddCorrespondenceForm(${idx})">إضافة مراسلة جديدة</button>
        <h3 style="margin-top:25px;">سجل المراسلات</h3>
        <div id="corrs"></div>
    `;
    showCorrespondences(idx);
}
window.showCustomerDetails = showCustomerDetails;

function showCorrespondences(idx) {
    let c = customers[idx];
    let html = "";
    if (c.correspondences.length === 0) html = "<i>لا يوجد مراسلات بعد.</i>";
    c.correspondences.forEach((cor, i) => {
        html += `<div class="correspondence">
            <b>${cor.type}</b> | ${cor.date} | جهة: ${cor.entity}<br>
            <div>${cor.text}</div>
            ${cor.attachment ? `<a href="${cor.attachment.data}" target="_blank" class="attachment-link">عرض المرفق (${cor.attachment.name})</a>` : ""}
            <br><button class="secondary" onclick="deleteCorrespondence(${idx},${i})">حذف</button>
        </div>`;
    });
    document.getElementById("corrs").innerHTML = html;
}
window.showCorrespondences = showCorrespondences;

function deleteCorrespondence(idx, i) {
    customers[idx].correspondences.splice(i,1);
    saveCustomers();
    showCustomerDetails(idx);
}
window.deleteCorrespondence = deleteCorrespondence;

// ========== إضافة مراسلة ==========
function showAddCorrespondenceForm(idx) {
    document.getElementById("app").innerHTML = `
        <button onclick="showCustomerDetails(${idx})" class="secondary">رجوع</button>
        <h2>إضافة مراسلة للعميل</h2>
        <label>نوع المراسلة</label>
        <select id="cor-type">
            <option>واردة</option>
            <option>صادرة</option>
        </select>
        <label>الجهة</label>
        <input id="cor-entity" placeholder="مثال: تاون جاس">
        <label>التاريخ</label>
        <input id="cor-date" type="date" value="${(new Date()).toISOString().slice(0,10)}">
        <label>نص المراسلة</label>
        <textarea id="cor-text"></textarea>
        <label>مرفق (اختياري)</label>
        <input type="file" id="cor-file">
        <br>
        <button onclick="addCorrespondence(${idx})">حفظ</button>
        <button class="secondary" onclick="showCustomerDetails(${idx})">إلغاء</button>
    `;
}
window.showAddCorrespondenceForm = showAddCorrespondenceForm;

function addCorrespondence(idx) {
    let f = document.getElementById("cor-file").files[0];
    if (f) {
        let reader = new FileReader();
        reader.onload = function(e) {
            saveCorrespondenceWithFile(idx, e.target.result, f.name);
        };
        reader.readAsDataURL(f);
    } else {
        saveCorrespondenceWithFile(idx, null, null);
    }
}
window.addCorrespondence = addCorrespondence;

function saveCorrespondenceWithFile(idx, fileData, fileName) {
    let cor = {
        type: document.getElementById("cor-type").value,
        entity: document.getElementById("cor-entity").value,
        date: document.getElementById("cor-date").value,
        text: document.getElementById("cor-text").value,
        attachment: fileData ? { data: fileData, name: fileName } : null
    };
    customers[idx].correspondences.push(cor);
    saveCustomers();
    showCustomerDetails(idx);
}
window.saveCorrespondenceWithFile = saveCorrespondenceWithFile;

// ========== بدء التطبيق ==========
render();
