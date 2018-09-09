function configureEditButtons() {
    var createEndpoint = document.getElementById('create_endpoint_button');
    createEndpoint.addEventListener("click", createEndpointSelector, false);

    var create = document.getElementById('edit_button');
    create.addEventListener("click", editVlan, false);

    var cancel = document.getElementById('cancel_button');
    cancel.addEventListener("click", cancelVlan, false);
}

function loadVlanDetails() {
    var cookie    = Cookies.getJSON('vce');
    var name      = cookie.switch;
    var vlanId    = cookie.selectedVlanId;
    var workgroup = cookie.workgroup;

    var crumb = document.getElementById("switch_name_crumb");
    crumb.innerHTML = name;

    var url = baseUrl + 'access.cgi?method=get_vlan_details';
    url += '&workgroup=' + workgroup;
    url += '&vlan_id=' + vlanId;
    fetch(url, {method: 'get', credentials: 'include'}).then(function(response) {
        response.json().then(function(data) {
            if (typeof data.error !== 'undefined') {
                return displayError(data.error.msg);
            }

            var circuit = data.results[0].circuit;
            // console.log(circuit);

            var desc = document.getElementById('description');
            desc.value = circuit.description;

            var vlan = document.getElementById('vlan');
            var set_vlan = false;
            for (var i = 0; i < vlan.options.length; i++) {
                if (vlan.options[i].value == circuit.vlan) {
                    vlan.selectedIndex = i;
                    set_vlan = true;
                    break;
                }
            }

            if (!set_vlan) {
                var dropd = document.getElementById("vlan_optgroup");
                var opt = document.createElement('option');
                opt.innerHTML = circuit.vlan;
                opt.setAttribute('value', circuit.vlan);
                dropd.appendChild(opt);
                vlan.selectedIndex = vlan.options.length - 1;
            }

            // Load and select reported endpoints
            for (var i = 0; i < circuit.endpoints.length; i++) {
                var select = createEndpointSelector();
                for (var j = 0; j < select.options.length; j++) {
                    if (select.options[j].value === circuit.endpoints[i].port) {
                        select.options[j].selected = true;
                    }
                }
            }
        });
    });
}


function editVlan(e) {
    var cookie    = Cookies.getJSON('vce');
    var name      = cookie.switch;
    var vlanId    = cookie.selectedVlanId;
    var workgroup = cookie.workgroup;

    var desc = document.getElementById('description');
    var text = desc.value;

    var vlan = document.getElementById('vlan');
    var vlan_id = vlan.options[vlan.selectedIndex].value;

    var endpoints = document.forms[1].endpoint;
    if(typeof endpoints === 'undefined')
        return displayError('Please select atleast one endpoint');
    if (endpoints.value === '') {
        var epNames = [];
        for (var i = 0; i < endpoints.length; i++) {
            epNames.push(endpoints[i].value);
        }
        endpoints = epNames;
    } else {
        endpoints = [endpoints.value];
    }

    // console.log(text);
    // console.log(vlan_id);
    // console.log(endpoints);
    // console.log(vlanId);

    var url = baseUrl + 'provisioning.cgi?method=edit_vlan';
    url += '&workgroup=' + workgroup;
    url += '&description=' + text;
    url += '&switch=' + name;
    url += '&vlan=' + vlan_id;
    url += '&vlan_id=' + vlanId;
    url += endpoints.map(function(e) {
        return '&port=' + e;
    }).join('');

    // console.log(url);
    fetch(url, {method: 'get', credentials: 'include'}).then(function(response) {
        response.json().then(function(data) {
            // console.log(data);
            if (typeof data.error !== 'undefined') {
                return displayError(data.error.msg);
            }
	    setDisplayMessage('success', 'Vlan edited successfully.' + data.msg);
            window.location.href = 'details.html?tab=vlan';
        });
    });
}
