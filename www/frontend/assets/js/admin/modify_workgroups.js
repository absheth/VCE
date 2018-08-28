window.onload = init;

async function init() {
    getWorkgroups().then(function(workgroups) {
        renderWorkgroupList(workgroups);
    });

    let params = new URLSearchParams(location.search);
    let workgroup_id = params.get('workgroup_id');

    getWorkgroup(workgroup_id).then(function(wg) {
        renderWorkgroup(wg);
    });

    getInterfaces(workgroup_id).then(function(intfs) {
        renderInterfaceList(intfs);
    });

    document.querySelector('#workgroup-tab').addEventListener('click', function(e) {
        document.querySelector('#interface-tab').classList.remove("is-active");
        document.querySelector('#interface-tab-content').style.display = 'none';
        document.querySelector('#user-tab').classList.remove("is-active");
        document.querySelector('#user-tab-content').style.display = 'none';
        document.querySelector('#workgroup-tab-content').style.display = 'block';
        e.target.parentElement.classList.add("is-active");
    });
    document.querySelector('#interface-tab').addEventListener('click', function(e) {
        document.querySelector('#workgroup-tab').classList.remove("is-active");
        document.querySelector('#workgroup-tab-content').style.display = 'none';
        document.querySelector('#user-tab').classList.remove("is-active");
        document.querySelector('#user-tab-content').style.display = 'none';
        document.querySelector('#interface-tab-content').style.display = 'block';
        e.target.parentElement.classList.add("is-active");
    });
    document.querySelector('#user-tab').addEventListener('click', function(e) {
        document.querySelector('#interface-tab').classList.remove("is-active");
        document.querySelector('#interface-tab-content').style.display = 'none';
        document.querySelector('#workgroup-tab').classList.remove("is-active");
        document.querySelector('#workgroup-tab-content').style.display = 'none';
        document.querySelector('#user-tab-content').style.display = 'block';
        e.target.parentElement.classList.add("is-active");
    });
};

function modifyWorkgroup(form) {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let post = async function(data) {
        let id = data.get('id');

        try {
            const url = '../api/workgroup.cgi';
            const resp = await fetch(url, {method: 'post', credentials: 'include', body: data});
            const obj = await resp.json();

            if ('error_text' in obj) {
                console.log(obj.error_text);
                return false;
            }
            window.location.href = `modify_workgroups.html?workgroup_id=${id}`;
        } catch (error) {
            console.log(error);
            return false;
        }
    };

    form.workgroup.value = workgroup;

    let data = new FormData(form);
    post(data);
    return false;
}

function deleteWorkgroup() {
    let ok = confirm('Are you sure you wish to delete this workgroup?');
    if (!ok) {
        return false;
    }

    let del = async function(data) {
        let cookie = Cookies.getJSON('vce');
        let wg = cookie.workgroup;

        let id = data.get('id');
        let method = 'delete_workgroup';

        try {
            const url = `../api/workgroup.cgi?method=${method}&id=${id}&workgroup=${wg}`;
            const resp = await fetch(url, {method: 'get', credentials: 'include'});
            const obj = await resp.json();

            if ('error_text' in obj) {
                console.log(obj.error_text);
                return false;
            }
            window.location.href = `workgroups.html`;
        } catch (error) {
            console.log(error);
            return false;
        }
    };

    let form = document.forms['modify-workgroup'];
    let data = new FormData(form);
    del(data);
    return false;
}

async function getWorkgroup(workgroup_id) {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let url = '../' + baseUrl + `workgroup.cgi?method=get_workgroups&workgroup=${workgroup}&workgroup_id=${workgroup_id}`;
    let response = await fetch(url, {method: 'get', credentials: 'include'});

    try {
        let data = await response.json();
        if ('error_text' in data) {
            console.log(data.error_text);
            return null;
        }
        return data.results[0];
    } catch(error) {
        console.log(error);
        return null;
    }
}

async function renderWorkgroup(sw) {
    let form = document.forms['modify-workgroup'];
    form.elements['id'].value = sw.id;
    form.elements['name'].value = sw.name;
    form.elements['description'].value = sw.description;
}

async function getWorkgroups() {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let url = '../' + baseUrl + `workgroup.cgi?method=get_workgroups&workgroup=${workgroup}`;
    let response = await fetch(url, {method: 'get', credentials: 'include'});

    try {
        let data = await response.json();
        if ('error_text' in data) {
            console.log(data.error_text);
            return [];
        }
        return data.results;
    } catch(error) {
        console.log(error);
        return null;
    }
}

async function renderWorkgroupList(workgroups) {
    let list = document.querySelector('#aside-list');
    let items = '';

    workgroups.forEach(function(workgroup) {
        items += `<li><a href="modify_workgroups.html?workgroup_id=${workgroup.id}">${workgroup.name}</a></li>`;
    });

    list.innerHTML = items;
}

async function getInterfaces(workgroup_id) {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let url = '../' + baseUrl + `interface.cgi?method=get_interfaces&workgroup=${workgroup}&workgroup_id=${workgroup_id}`;
    let response = await fetch(url, {method: 'get', credentials: 'include'});

    try {
        let data = await response.json();
        if ('error_text' in data) {
            console.log(data.error_text);
            return null;
        }
        return data.results;
    } catch(error) {
        console.log(error);
        return null;
    }
}

async function renderInterfaceList(interfaces) {
    let list = document.querySelector('#workgroup-interface-list');
    let items = '';

    let params = new URLSearchParams(location.search);
    let switch_id = params.get('switch_id');

    interfaces.forEach(function(intf) {
        items += `
<tr>
  <td></td><td>${intf.name}</td><td>${intf.hardware_type}</td><td>${intf.description}</td>
</tr>`;
    });

    list.innerHTML = items;
}
