let dataGrid

renderGrid()

const NOTIFY_STATUS = {
  SUCCESS:'success',
  WARNING:'warning',
  ERROR:'error'
}

function pushNotify(status, title, text) {
  new Notify({
    status: status,
    title: title,
    text: text,
    effect: 'fade',
    speed: 300,
    customClass: null,
    customIcon: null,
    showIcon: true,
    showCloseButton: true,
    autoclose: true,
    autotimeout: 3000,
    gap: 20,
    distance: 20,
    type: 1,
    position: 'right top'
  })
}

function renderGrid(data = []) {
  dataGrid = $('#dx-grid').dxDataGrid({
      dataSource: data,
      // keyExpr: 'Kode Mesin Motor (5 digit pertama)',
      columns: [
        { dataField: "noinden", caption:"No Inden" },
        { dataField: "gudang", groupIndex: 0 }
      ],
      groupPanel: { visible: true },
      showBorders: true,
      allowColumnResizing: true,
      paging: {
        pageSize: 10,
        enabled: true,
      },
      pager: {
        showInfo: true,
        showPageSizeSelector: true,
        showNavigationButtons: true
      },
      editing: {
          mode: 'row',
          allowUpdating: false,
          allowDeleting: false,
          allowAdding: false,
      },
      scrolling: {
        columnRenderingMode: 'virtual',
      },
      toolbar: {
        items: [
            'groupPanel',
            {
                location: "before",
                widget: "dxButton",
                options: {
                    text: "Reset",
                    elementAttr: {
                        id: "cancelToolbar",
                    },
                    onClick(e) {
                      cancelDataGrid()
                    },
                },
            },
            {
                location: "after",
                widget: "dxButton",
                options: {
                    text: "Proses",
                    elementAttr: {
                        id: "prosesToolbar",
                    },
                    onClick(e) {
                      processDataGrid()
                    },
                },
            }
        ]
    },
    }).dxDataGrid("instance");
    
    if (!data || data.length == 0)  $("#prosesToolbar").hide()
    if (!data || data.length == 0)  $("#cancelToolbar").hide()
}

$("#file_upload").change(function (evt) {
    var selectedFile = evt.target.files[0];
    if (!selectedFile) {
        renderGrid()
        return
    }

    var reader = new FileReader();
    reader.onload = function (event) {
        var data = event.target.result;
        var workbook = XLSX.read(data, {
            type: 'binary'
        });

        const indentData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[0]]) || [];

        if (!indentData || indentData.length == 0) {
            renderGrid()
            return
        }

        const indentResult = []

        for (let i = 0; i < indentData.length; i++) {

          const indent = indentData[i];

          const keys = Object.keys(indent)

          const _obj = {
            'noinden': indent[keys[0]],
            'gudang': indent[keys[1]]
          }
          indentResult.push(_obj)
        }
        
        const {exeededGdg, max} = checkMaxData(indentResult)

        if (exeededGdg.length == 0) {
          renderGrid(indentResult)
        } else {
          pushNotify(NOTIFY_STATUS.WARNING, "Info", 
          `
            Dimohon untuk nomor indent per gudang tidak lebih dari ${max} baris.
            Bisa dicek kembali untuk gudang berikut: ${exeededGdg.join(',').replace(/,\s*$/, "")}
           `)
           cancelDataGrid()
        }

    };
    reader.onerror = function (event) {
        console.error("File could not be read! Code " + event.target.error.code);
    };
    reader.readAsBinaryString(selectedFile);
});

function checkMaxData(data, max = 100) {
  const _data = data.reduce((acc, curr) => {
    const gdg = curr['gudang'].substring(0, 3)
    acc[gdg] = (acc[gdg]) ? [...acc[gdg], curr['noinden']] : [curr['noinden']]

    return acc
  }, {})

  const exeededGdg = []
  Object.keys(_data).forEach(key => {
    if (_data[key].length > max) {
      exeededGdg.push(key)
    }
  });

  return { exeededGdg, max}
}

function processDataGrid() {
  dataGrid.getDataSource().store().load().done((data)=>{  
    const _data = data.reduce((acc, curr) => {
      const gdg = curr['gudang'].substring(0, 3)
      acc[gdg] = (acc[gdg]) ? [...acc[gdg], curr['noinden']] : [curr['noinden']]

      return acc
    }, {})
    
    fetch(`${BASE_URL}/inject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(_data),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          pushNotify(NOTIFY_STATUS.SUCCESS, 'Sukses', 'Inject Plandist Sukses')
        } else {
          pushNotify(NOTIFY_STATUS.ERROR, 'Error', 'Inject Plandist Gagal Terupload')
        }
      })
  });  
}

function cancelDataGrid() {
  $("#file_upload").val(null)
  renderGrid()
}