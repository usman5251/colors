window.addEventListener('DOMContentLoaded', () => {
    // get time and date
    var currentStock = 0;
    var totalStockWorth = 0;
    var liste;
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    //sync databases
    var localDB = new PouchDB('colors')
    var remoteDB = new PouchDB('http://ec2-3-85-5-117.compute-1.amazonaws.com:5984/colors');
    localDB.sync(remoteDB).on('complete', function () {
    console.log('Yay, we are in sync!')
    }).on('error', function (err) {
    console.log('Error while syncing database')
    });

    localDB.allDocs({include_docs: true, descending:true, skip : 1}, function(err, docs) {
    if (err) {
    return console.log(err);
    } else {
        liste = docs.rows;
    for (var i = 0; i < liste.length; i++) {
        currentStock += parseInt(liste[i].doc.stock);
        totalStockWorth += parseInt(liste[i].doc.price) * parseInt(liste[i].doc.stock);
    }
    
    console.log(liste.length)
    document.querySelector('#totalProducts').innerHTML += `${liste.length}`
    document.querySelector('#totalStock').innerHTML += `${currentStock}`
    document.querySelector('#totalStockWorth').innerHTML += `Rs.${totalStockWorth}`
    console.log(liste)
    
    }
    });
});