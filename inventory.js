function optionExists ( needle, haystack )
{
    var optionExists = false,
        optionsLength = haystack.length;

    while ( optionsLength-- )
    {
        if ( haystack.options[ optionsLength ].value === needle )
        {
            optionExists = true;
            break;
        }
    }
    return optionExists;
}
window.addEventListener('DOMContentLoaded', () => {
  // get time and date
  var liste;
  var today = new Date();
  var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  //sync databases
  var localDB = new PouchDB('colors')
  var remoteDB = new PouchDB('http://ec2-3-85-5-117.compute-1.amazonaws.com:5984/colors');
  localDB.sync(remoteDB).on('complete', function () {
    console.log('Yay, we are in sync!')
  }).on('error', function (err) {
    console.log('Error while syncing database')
  });

  localDB.allDocs({ include_docs: true, descending: true, skip: 3 }, function (err, docs) {
    if (err) {
      return console.log(err);
    } else {
      liste = docs.rows;
      console.log(liste.length)
      //document.querySelector('#banner').innerHTML += `<div class="col-sm-2">Total Products in inventory ${liste.length}</div>`;
      //console.log(liste)
      for (var i = 0; i < liste.length; i++) {
        console.log(liste[i].doc.name);
        category = liste[i].doc.category;
        barcode = liste[i].id;
        stock = liste[i].doc.stock;
        sku = liste[i].doc.sku;
        color = liste[i].doc.color;
        size = liste[i].doc.size;
        var table = `<tr><th scope="row">${i + 1}</th><td>${barcode}</td><td>${category}</td><td>${sku}</td><td>${size}</td><td>${color}</td><td>${stock}</td><td><button class="btn" data-toggle="modal" data-target="#addmodal" data-value="${barcode}"><i class="fa fa-plus"></i></button> <button class="btn" data-toggle="modal" data-target="#minusmodal" data-value="${barcode}"><i class="fa fa-minus"></i></button> <button class="btn" data-toggle="modal" data-target="#deletemodal" data-value="${barcode}"><i class="fa fa-trash"></i></button> <button class="btn" data-toggle="modal" data-target="#updateProductModal" data-value="${barcode}"><i class="fa fa-pencil"></i></button></td></tr>`;
        document.querySelector('#details').innerHTML += table;
      }
    }
  });
  $('#addmodal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var barcode = button.data('value') // Extract info from data-* attributes
    //console.log(barcode);
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    document.querySelector('#addStockConfirm',).addEventListener('click', () => {
      var quantity = document.querySelector('#addStock').value;
      if (quantity == '') {
        alert('Please enter stock quantity');
        return;
      }
      localDB.get(`${barcode}`).then(function (doc) {
        return localDB.put({
          _id: doc._id,
          _rev: doc._rev,
          sku: doc.sku,
          category: doc.category,
          stock: parseInt(doc.stock) + parseInt(quantity),
          color: doc.color,
          cost: doc.cost,
          price: doc.price,
          totalsold: doc.totalsold,
          dateadded: doc.date,
          size: doc.size
        });
      }).then(function (response) {
        alert("Stock Added Successfully")
      }).catch(function (err) {
        console.log(err);
      });
      setTimeout(function () {
        location.reload(true);
      }, 500);
    });
  });
  $('#minusmodal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var barcode = button.data('value') // Extract info from data-* attributes
    //console.log(barcode);
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    document.querySelector('#minusStockConfirm',).addEventListener('click', () => {
      var quantity = document.querySelector('#minusStock').value;
      if (quantity == '') {
        alert('Please enter stock quantity');
        return;
      }
      localDB.get(`${barcode}`).then(function (doc) {
        return localDB.put({
          _id: doc._id,
          _rev: doc._rev,
          category: doc.category,
          sku: doc.sku,
          stock: parseInt(doc.stock) - parseInt(quantity),
          color: doc.color,
          cost: doc.cost,
          price: doc.price,
          totalsold: doc.totalsold,
          dateadded: doc.date,
          size: doc.size
        });
      }).then(function (response) {
        alert("Stock Subtracted Successfully")
      }).catch(function (err) {
        console.log(err);
      });
      setTimeout(function () {
        location.reload(true);
      }, 500);
    });
  });

  $('#deletemodal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var barcode = button.data('value') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    document.querySelector('#deleteProductConfirm',).addEventListener('click', () => {
      localDB.get(`${barcode}`).then(function (doc) {
        return localDB.remove(doc._id, doc._rev);

      }).then(function (response) {
        alert("Product Deleted successfully")
      }).catch(function (err) {
        console.log(err);
      });
      setTimeout(function () {
        location.reload(true);
      }, 500);
    });
  });

  $('#AddNewProductModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var barcode = button.data('value') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    document.querySelector('#barcode').value = (new Date()).getTime();

    //custom field
    ele = document.querySelector('#size');
    ele.addEventListener('change', () => {
      if (ele.value == 'Custom') {
        document.querySelector('#customsize').style.display = 'flex';
      } else {
        document.querySelector('#customsize').style.display = 'none';
      }
    });
    document.querySelector('#AddNewProductConfirm',).addEventListener('click', () => {
      var barcode = document.querySelector('#barcode').value;
      var category = document.querySelector('#category').value;
      var sku = document.querySelector('#sku').value;
      var stock = document.querySelector('#stock').value;
      var color = document.querySelector('#color').value;
      var cost = document.querySelector('#cost').value;
      var price = document.querySelector('#saleprice').value;
      if (document.querySelector('#size').value == 'Custom') {
        var size = document.querySelector('#customsizeval').value;
      } else {
        var size = document.querySelector('#size').value;
      }
      if (barcode == '' || category == '' || sku == '' || stock == '' || color == '' || cost == '' || price == '' || size == '') {
        alert("Invalid product description");
        return;
      }
      var doc = {
        "_id": `${barcode}`,
        "category": `${category}`,
        "sku": `${sku}`,
        "stock": `${stock}`,
        "color": `${color}`,
        "cost": `${cost}`,
        "price": `${price}`,
        "totalsold": 0,
        "dateadded": `${date}`,
        "size": `${size}`
      };
      console.log(doc);
      try {
        localDB.put(doc);
        alert("Product added successfully")
      }
      catch (err) {
        alert("Error during product update")
      }
      setTimeout(function () {
        location.reload(true);
      }, 500);
    });
  });
  searchitem = document.querySelector('#search');
  searchitem.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      if (searchitem.value != '') {
        var table = document.querySelector('#details');
        var child = table.lastElementChild;
        while (child) {
          table.removeChild(child);
          child = table.lastElementChild;
        }
        for (var i = 0; i < liste.length; i++) {
          a = searchitem.value;
          category = liste[i].doc.category;
          barcode = liste[i].id;
          stock = liste[i].doc.stock;
          sku = liste[i].doc.sku;
          color = liste[i].doc.color;
          size = liste[i].doc.size;
          //console.log(barcode,sku,category,stock,color,size)
          if (barcode.toString().toLowerCase() == a.toString().toLowerCase() || sku.toString().toLowerCase() == a.toString().toLowerCase() || category.toString().toLowerCase() == a.toString().toLowerCase() || color.toString().toLowerCase() == a.toString().toLowerCase() || size.toString().toLowerCase() == a.toString().toLowerCase() || stock.toString().toLowerCase() == a.toString().toLowerCase()) {
            var table = `<tr><th scope="row">${i + 1}</th><td>${barcode}</td><td>${category}</td><td>${sku}</td><td>${size}</td><td>${color}</td><td>${stock}</td><td><button class="btn" data-toggle="modal" data-target="#addmodal" data-value="${barcode}"><i class="fa fa-plus"></i></button> <button class="btn" data-toggle="modal" data-target="#minusmodal" data-value="${barcode}"><i class="fa fa-minus"></i></button> <button class="btn" data-toggle="modal" data-target="#deletemodal" data-value="${barcode}"><i class="fa fa-trash"></i></button></button> <button class="btn" data-toggle="modal" data-target="#updateProductModal" data-value="${barcode}"><i class="fa fa-pencil"></i></button></td></tr>`;
            document.querySelector('#details').innerHTML += table;
          }

        }
      }
    }
  });

  searchitem.addEventListener('keyup', () => {
    //console.log('26')
    if (searchitem.value == '') {
      var table = document.querySelector('#details');
      var child = table.lastElementChild;
      while (child) {
        table.removeChild(child);
        child = table.lastElementChild;
      }
      for (var i = 0; i < liste.length; i++) {
        console.log(liste[i].doc.name);
        category = liste[i].doc.category;
        barcode = liste[i].id;
        stock = liste[i].doc.stock;
        sku = liste[i].doc.sku;
        color = liste[i].doc.color;
        size = liste[i].doc.size;
        var table = `<tr><th scope="row">${i + 1}</th><td>${barcode}</td><td>${category}</td><td>${sku}</td><td>${size}</td><td>${color}</td><td>${stock}</td><td><button class="btn" data-toggle="modal" data-target="#addmodal" data-value="${barcode}"><i class="fa fa-plus"></i></button> <button class="btn" data-toggle="modal" data-target="#minusmodal" data-value="${barcode}"><i class="fa fa-minus"></i></button> <button class="btn" data-toggle="modal" data-target="#deletemodal" data-value="${barcode}"><i class="fa fa-trash"></i></button></button> <button class="btn" data-toggle="modal" data-target="#updateProductModal" data-value="${barcode}"><i class="fa fa-pencil"></i></button></td></tr>`;
        document.querySelector('#details').innerHTML += table;
      }
    }
  });


  // update product 
  ele = document.querySelector('#sizeUpdate');
    ele.addEventListener('change', () => {
      console.log('change')
      if (ele.value === 'Custom') {
        document.querySelector('#customSizeDiv').style.display = 'flex';
      } else {
        document.querySelector('#customSizeDiv').style.display = 'none';
      }
    });
  $('#updateProductModal').on('show.bs.modal', function (event) {
    //reset fields 
    document.querySelector('#customSizeUpdate').value = '';
    document.querySelector('#customSizeDiv').style.display = 'none';
    var button = $(event.relatedTarget) // Button that triggered the modal
    var barcode = button.data('value') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)

    localDB.get(`${barcode}`).then(function (doc) {
      var selector = document.querySelector;
      document.querySelector('#barcodeUpdate').value = barcode;
      document.querySelector('#categoryUpdate').value = doc.category;
      document.querySelector('#skuUpdate').value = doc.sku;
      document.querySelector('#colorUpdate').value = doc.color;
      if (optionExists(doc.size, document.getElementById('sizeUpdate'))) {
        document.querySelector('#sizeUpdate').value = doc.size;
      } else {
        document.querySelector('#sizeUpdate').value = 'Custom';
        document.querySelector('#customSizeUpdate').value = doc.size;
        document.querySelector('#customSizeDiv').style.display = 'flex';
      }
      document.querySelector('#costUpdate').value = doc.cost;
      document.querySelector('#salepriceUpdate').value = doc.price;
    });
    document.querySelector('#updateProductConfirm',).addEventListener('click', () => {
      if (document.querySelector('#sizeUpdate').value == 'Custom') {
        var newSize = document.querySelector('#customSizeUpdate').value;
      } else {
        var newSize = document.querySelector('#sizeUpdate').value;
      }
      if (document.querySelector('#barcodeUpdate').value = barcode == '' || document.querySelector('#categoryUpdate').value == '' || document.querySelector('#skuUpdate').value == '' || document.querySelector('#colorUpdate').value == '' || document.querySelector('#costUpdate').value == '' || document.querySelector('#salepriceUpdate').value == '' || newSize == '') {
        alert("Invalid product description");
        return;
      }
      localDB.get(`${barcode}`).then(function (doc) {
        return localDB.put({
          _id: doc._id,
          _rev: doc._rev,
          category: document.querySelector('#categoryUpdate').value,
          sku: document.querySelector('#skuUpdate').value,
          stock: parseInt(doc.stock),
          color: document.querySelector('#colorUpdate').value,
          cost: document.querySelector('#costUpdate').value,
          price: document.querySelector('#salepriceUpdate').value,
          totalsold: doc.totalsold,
          dateadded: doc.date,
          size: newSize
        });
      }).then(function (response) {
        alert("Product updated successfully")
      }).catch(function (err) {
        console.log(err);
      });
      setTimeout(function () {
        location.reload(true);
      }, 500);
    });
  });
});