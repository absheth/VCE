window.onload = init;

async function init() {
    getSwitches().then(function(switches) {
        renderSwitchList(switches);
    });

    let params = new URLSearchParams(location.search);
    let switch_id = params.get('switch_id');

    getSwitch(switch_id).then(function(sw) {
        renderSwitch(sw);
    });

    getInterfaces(switch_id).then(function(intfs) {
        renderInterfaceList(intfs);
    });

    getCommands(switch_id).then(function(cmds) {
        renderCommands(cmds);
    });

    document.querySelector('#switch-tab').addEventListener('click', function(e) {
        document.querySelector('#command-tab').classList.remove("is-active");
        document.querySelector('#command-tab-content').style.display = 'none';
        document.querySelector('#switch-tab-content').style.display = 'block';
        e.target.parentElement.classList.add("is-active");
    });
    document.querySelector('#command-tab').addEventListener('click', function(e) {
        document.querySelector('#switch-tab').classList.remove("is-active");
        document.querySelector('#switch-tab-content').style.display = 'none';
        document.querySelector('#command-tab-content').style.display = 'block';
        e.target.parentElement.classList.add("is-active");
    });
};

function modifySwitch(form) {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let post = async function(data) {
        let id = data.get('id');

        try {
            const url = '../api/switch.cgi';
            const resp = await fetch(url, {method: 'post', credentials: 'include', body: data});
            const obj = await resp.json();

            if ('error_text' in obj) {
                console.log(obj.error_text);
                return false;
            }
            window.location.href = `modify_switches.html?switch_id=${id}`;
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

function deleteSwitch() {
    let ok = confirm('Are you sure you wish to delete this device?');
    if (!ok) {
        return false;
    }

    let del = async function(data) {
        let cookie = Cookies.getJSON('vce');
        let wg = cookie.workgroup;

        let id = data.get('id');
        let method = 'delete_switch';

        try {
            const url = `../api/switch.cgi?method=${method}&id=${id}&workgroup=${wg}`;
            const resp = await fetch(url, {method: 'get', credentials: 'include'});
            const obj = await resp.json();

            if ('error_text' in obj) {
                console.log(obj.error_text);
                return false;
            }
            window.location.href = `switches.html`;
        } catch (error) {
            console.log(error);
            return false;
        }
    };

    let form = document.forms['modify-switch'];
    let data = new FormData(form);
    del(data);
    return false;
}

async function getSwitch(switch_id) {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let url = '../' + baseUrl + `switch.cgi?method=get_switches&workgroup=${workgroup}&switch_id=${switch_id}`;
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

async function renderSwitch(sw) {
    let form = document.forms['modify-switch'];
    form.elements['id'].value = sw.id;
    form.elements['name'].value = sw.name;
    form.elements['description'].value = sw.description;
    form.elements['ip'].value = sw.ipv4;
    form.elements['ssh'].value = sw.ssh;
    form.elements['netconf'].value = sw.netconf;
    form.elements['vendor'].value = sw.vendor;
    form.elements['model'].value = sw.model;
    form.elements['version'].value = sw.version;
}

async function getSwitches() {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let url = '../' + baseUrl + `switch.cgi?method=get_switches&workgroup=${workgroup}`;
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

async function renderSwitchList(switches) {
    let list = document.querySelector('#aside-list');
    let items = '';

    let params = new URLSearchParams(location.search);
    let switch_id = params.get('switch_id');

    switches.forEach(function(sw) {
        if (sw.id == switch_id) {
            items += `<li><a class="is-active" href="modify_switches.html?switch_id=${sw.id}">${sw.name}</a></li>`;
        } else {
            items += `<li><a href="modify_switches.html?switch_id=${sw.id}">${sw.name}</a></li>`;
        }
    });

    list.innerHTML = items;
}


async function getInterfaces(switch_id) {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let url = '../' + baseUrl + `interface.cgi?method=get_interfaces&workgroup=${workgroup}&switch_id=${switch_id}`;
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
    let list = document.querySelector('#aside2-list');
    let items = '';

    let params = new URLSearchParams(location.search);
    let switch_id = params.get('switch_id');

    interfaces.forEach(function(intf) {
        items += `<li><a href="modify_interfaces.html?switch_id=${switch_id}&interface_id=${intf.id}">${intf.name}</a></li>`;
    });

    if (interfaces.length === 0) {
        items += `<li><a>No interfaces</a></li>`;
    }
    list.innerHTML = items;
}

async function getCommands(switch_id) {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let url = '../' + baseUrl + `switch.cgi?method=get_switch_commands&workgroup=${workgroup}&switch_id=${switch_id}`;
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

async function addCommandToSwitch(command_id) {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let params = new URLSearchParams(location.search);
    let switch_id = params.get('switch_id');

    let role = document.querySelector(`#command-${command_id}-role`).value;

    let data = new FormData();
    data.set('method', 'add_command_to_switch');
    data.set('workgroup', workgroup);
    data.set('command_id', command_id);
    data.set('switch_id', switch_id);
    data.set('role', role);

    try {
        const url = '../api/switch.cgi';
        const resp = await fetch(url, {method: 'post', credentials: 'include', body: data});
        const obj  = await resp.json();

        if ('error_text' in obj) throw obj.error_text;

        let cmd = document.querySelector(`#command-${command_id}`);
        cmd.dataset.switchCommandId = obj.results[0].id;
        let cmdRole = document.querySelector(`#command-${command_id}-role`);
        cmdRole.dataset.switchCommandId = obj.results[0].id;
        console.log('Command enabled.');
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function removeCommandFromSwitch(command_id, switch_command_id) {
    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let params = new URLSearchParams(location.search);
    let switch_id = params.get('switch_id');

    try {
        const url = `../api/switch.cgi?method=remove_command_from_switch&workgroup=${workgroup}&id=${switch_command_id}`;
        const resp = await fetch(url, {method: 'get', credentials: 'include'});
        const obj  = await resp.json();

        if ('error_text' in obj) throw obj.error_text;

        let cmd = document.querySelector(`#command-${command_id}`);
        cmd.dataset.switchCommandId = -1;
        let cmdRole = document.querySelector(`#command-${command_id}-role`);
        cmdRole.dataset.switchCommandId = -1;
        console.log('Command disabled.');
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function toggleCommand(e) {
    let command_id = e.dataset.id;
    let switch_command_id = e.dataset.switchCommandId;

    if (e.checked) {
        addCommandToSwitch(command_id);
    } else {
        removeCommandFromSwitch(command_id, switch_command_id);
    }
}

async function updateCommandRole(e) {
    if (e.dataset.switchCommandId === 'null' || e.dataset.switchCommandId == -1) {
        return false;
    }

    let cookie = Cookies.getJSON('vce');
    let workgroup = cookie.workgroup;

    let role = e.value;
    let switch_command_id = e.dataset.switchCommandId;

    try {
        const url = `../api/switch.cgi?method=modify_switch_command&workgroup=${workgroup}&id=${switch_command_id}&role=${role}`;
        const resp = await fetch(url, {method: 'get', credentials: 'include'});
        const obj  = await resp.json();

        if ('error_text' in obj) throw obj.error_text;

        console.log('Command role updated.');
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function renderCommands(cmds) {
    let intfs = '';
    let sws = '';
    let vlans = '';

    cmds.forEach(function(cmd) {
        let row = `
<tr>
  <td><label class="checkbox">
    <input id="command-${cmd.id}" data-id="${cmd.id}" data-switch-command-id="${cmd.switch_command_id}" onclick="toggleCommand(this)" type="checkbox" ${cmd.switch_command_id != null ? 'checked' : ''}>
  </label></td>
  <td><div style="font-family: monospace">${cmd.template}</div></td>
  <td>
    <div class="select is-small">
      <select id="command-${cmd.id}-role" data-switch-command-id="${cmd.switch_command_id}" onchange="updateCommandRole(this)">
        <option ${cmd.role == 'admin' ? 'selected' : ''}>admin</option>
        <option ${cmd.role == 'owner' ? 'selected' : ''}>owner</option>
        <option ${cmd.role == 'user' ? 'selected' : ''}>user</option>
      </select>
    </div>
  </td>
  <td>${cmd.operation == 'read' ? 'Read' : 'Write'}</td>
</tr>`;
        if (cmd.type === 'interface') {
            intfs += row;
        } else if (cmd.type === 'switch') {
            sws += row;
        } else if (cmd.type === 'vlan') {
            vlans += row;
        } else {
            console.log(row);
        }
    });

    let ilist = document.querySelector('#interface-command-list');
    ilist.innerHTML = intfs;

    let slist = document.querySelector('#switch-command-list');
    slist.innerHTML = sws;

    let vlist = document.querySelector('#vlan-command-list');
    vlist.innerHTML = vlans;
}
