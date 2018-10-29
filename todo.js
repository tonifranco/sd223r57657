function onLoad() {
    document.addEventListener("ionItemReorder", saveList);
    document.addEventListener("ionModalDidDismiss", closeItems);
    document.addEventListener("ionAlertDidDismiss", closeItems);
    document.querySelectorAll('ion-tab').forEach(function(t) {
        t.querySelector('ion-reorder-group').innerHTML = localStorage.getItem('todo-list-'+t.icon);
    });
}
function getTab() {
    var tabs = document.querySelectorAll('ion-tab');
    for(let i=0; i<tabs.length; i++) { if (tabs[i].selected) return(tabs[i]); }
}
function getList() {
    return(getTab().querySelector('ion-reorder-group').innerHTML);
}
function updateList(list) {
    getTab().querySelector('ion-reorder-group').innerHTML = list;
}
function saveList() {
    localStorage.setItem('todo-list-'+getTab().icon, getList());
    navigator.vibrate(50);
}
function toggleReorder() {
    var reorder = getTab().querySelector('ion-reorder-group');
    reorder.disabled = !reorder.disabled;
}
function closeItems() {
    getTab().querySelector('ion-list').closeSlidingItems();
}
function taskHTML(text, date, icon) {
    return(`<ion-item onClick="addEditItem(this.parentNode)">
                <ion-label text-wrap>
                    <h2>`+text+`</h2>
                    <p>`+date+`</p>
                </ion-label>
                <ion-icon slot="end" name="`+icon+`"></ion-icon>
                <ion-reorder slot="end"></ion-reorder>
            </ion-item>
            <ion-item-options side="start">
                <ion-item-option color="primary" onClick="deleteItem(this.parentNode.parentNode)">
                    <ion-icon slot="icon-only" name="trash"></ion-icon>
                </ion-item-option>
            </ion-item-options>`);
}
async function deleteItem(item) {
    const alertController = document.querySelector('ion-alert-controller');
    await alertController.componentOnReady();
  
    const alert = await alertController.create({
        header: item ? 'Eliminar tasca' : 'Eliminar-les totes les tasques',
        message: 'Estas segur?',
        buttons: [
            {
                text: 'Sí',
                handler: () => {
                    if (item) {
                        item.remove();
                    }
                    else { 
                        updateList('');
                    }
                    saveList();
                }
            },
            {
                text: 'No',
                role: 'cancel'
            }        
        ]
    });
    return await alert.present();
}
async function error(message) {
    const alertController = document.querySelector('ion-alert-controller');
    await alertController.componentOnReady();
    const alert = await alertController.create({
        message: message,
        buttons: ['OK']
    });
    return await alert.present();
}
async function addEditItem(item) {
    const modalController = document.querySelector('ion-modal-controller');
    await modalController.componentOnReady();
    var task = item ? item.querySelector('h2').innerHTML : "";
    var date = item ? new Date(item.querySelector('p').innerHTML+' 12:00').toISOString() : new Date().toISOString();    
    var icon = item ? item.querySelector('ion-icon').name : "square-outline";
    const element = document.createElement('div');
    element.innerHTML = `
        <ion-header>
            <ion-toolbar>
                <ion-title>ToDo - `+(item ? 'Modificar tasca' : 'Nova tasca')+`</ion-title>
                <ion-buttons slot="primary">
                    <ion-button color="danger"><ion-icon slot="icon-only" name="close"></ion-icon></ion-button>
                    <ion-button color="primary"><ion-icon slot="icon-only" name="checkmark"></ion-icon></ion-button>
                </ion-buttons>       
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item>
                    <ion-label position="floating">Escull data</ion-label>
                    <ion-datetime display-format="D MMM YYYY" cancelText ="No" doneText = "OK" max="2050-12-31" value="`+date+`"> </ion-datetime>            
                </ion-item>
                <ion-item>
                    <ion-label position="floating">Ompli la tasca</ion-label>
                    <ion-input value="`+task+`"></ion-input>
                </ion-item>
            </ion-list>
            <ion-segment value="`+icon+`">
                <ion-segment-button value="square-outline">          <!-- radio-button-off   -on -->
                    <ion-icon name="square-outline"></ion-icon>      
                </ion-segment-button>  
                <ion-segment-button value="checkbox-outline">
                    <ion-icon name="checkbox-outline"></ion-icon>
                </ion-segment-button>  
                <ion-segment-button value="flag">
                    <ion-icon name="flag"></ion-icon>
                </ion-segment-button>
                <ion-segment-button value="flame">
                    <ion-icon name="flame"></ion-icon>
                </ion-segment-button>
            </ion-segment>
        </ion-content>`;
    // danger - primary
    element.querySelector('[color="danger"]').addEventListener('click', () => {
        modalController.dismiss();
    });
    element.querySelector('[color="primary"]').addEventListener('click', () => {
        var newDate = element.querySelector('.datetime-text').innerHTML;
        var newText = element.querySelector('ion-input').value;
        var newIcon = element.querySelector('ion-segment').value;
        if (!newText.length) {
            error('The task cannot be empty');
        }
        else {
            if (item) {
                item.close();
                item.innerHTML = taskHTML(newText,newDate,newIcon); 
                updateList(getList());
            }
            else {
                var newTask = '<ion-item-sliding>'+taskHTML(newText,newDate,newIcon)+'</ion-item-sliding>';
                updateList(getList()+newTask);
            }
            saveList();
            modalController.dismiss();
        }
    });
    const modalElement = await modalController.create({component:element});
    modalElement.present();
}
