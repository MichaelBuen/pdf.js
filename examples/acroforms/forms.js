
//
// Basic AcroForms input controls rendering
//

'use strict';

// Specify the PDF with AcroForm here
var pdfWithFormsPath = 'i-9.pdf';

var formFields = {};

function setupForm(div, content, viewport) {
  function bindInputItem(input, item) {
    if (input.name in formFields) {
      var value = formFields[input.name];
      if (input.type == 'checkbox') {
        input.checked = value;
      } else if (!input.type || input.type == 'text') {
        input.value = value;
      }
    }
    input.onchange = function pageViewSetupInputOnBlur() {
      if (input.type == 'checkbox') {
        formFields[input.name] = input.checked;
      } else if (!input.type || input.type == 'text') {
        formFields[input.name] = input.value;
      }
    };
  }
  function createElementWithStyle(tagName, item) {
    var element = document.createElement(tagName);
    var rect = PDFJS.Util.normalizeRect(
      viewport.convertToViewportRectangle(item.rect));
    element.style.left = Math.floor(rect[0]) + 'px';
    element.style.top = Math.floor(rect[1]) + 'px';
    element.style.width = Math.ceil(rect[2] - rect[0]) + 'px';
    element.style.height = Math.ceil(rect[3] - rect[1]) + 'px';
    return element;
  }
  function assignFontStyle(element, item) {
    var fontStyles = '';
    if ('fontSize' in item) {
      fontStyles += 'font-size: ' + Math.round(item.fontSize *
                                               viewport.fontScale) + 'px;';
    }
    switch (item.textAlignment) {
      case 0:
        fontStyles += 'text-align: left;';
        break;
      case 1:
        fontStyles += 'text-align: center;';
        break;
      case 2:
        fontStyles += 'text-align: right;';
        break;
    }
    element.setAttribute('style', element.getAttribute('style') + fontStyles);
  }
  
  
  
    function _extend(obj1, obj2) { // I do this because I don't want to rely on a base library like jQuery or underscore.js
        var obj3 = {};
        for (var prop in obj1) {
            obj3[prop] = obj1[prop];
        }
        for (var prop in obj2) {
            if (typeof(obj2[prop])!='undefined') { // don't let a rampant undefined override a value!
                obj3[prop] = obj2[prop];
            }
        }
        return obj3;
    }

  
//   function dropDownControlfunction(itemProperties, viewport) {
// 		var control = document.createElement('select');
// 		if (itemProperties.multiSelect)
// 			control.multiple=true;
// 		control.style.width = Math.floor(itemProperties.width-3) + 'px'; // small amount + borders
// 		control.style.height = Math.floor(itemProperties.height) + 'px'; // small amount + borders
// 		control.style.textAlign = itemProperties.textAlignment;
// 		if (Math.floor(itemProperties.fontSizeControl)>=Math.floor(itemProperties.height-2)) {
// 			control.style.fontSize = Math.floor(itemProperties.height-3) + 'px';
// 		}
// 		else {
// 			control.style.fontSize = itemProperties.fontSizeControl + 'px';
// 		}
// 		control.style.border = '1px solid #E6E6E6';
// 		control.style.display = 'block';
// 		if (itemProperties.options) {
// 			for (var option in itemProperties.options) {
// 				var optionElement = document.createElement('option');
// 				optionElement.value = itemProperties.options[option]['value'];
// 				optionElement.innerHTML = itemProperties.options[option]['text'];
// 				if (typeof(itemProperties.value)=='object') { // multiple selected values. To be implemented

// 				}
// 				else if(itemProperties.value==itemProperties.options[option]['value']) {
// 					optionElement.selected=true;
// 				}
// 				control.appendChild(optionElement);
// 			}

// 		}
// 		if (itemProperties.readOnly)
// 		{
// 			control.disabled='disabled';
// 			control.style.cursor = "not-allowed";
// 		}
// 		return control;
// 	}

  

  content.getAnnotations().then(function(items) {
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      
     
      
      switch (item.subtype) {
        case 'Widget':
          if (item.fieldType != 'Tx' && item.fieldType != 'Btn' &&
              item.fieldType != 'Ch') {
            break;
          }
          var inputDiv = createElementWithStyle('div', item);
          inputDiv.className = 'inputHint';
          div.appendChild(inputDiv);
          var input;
          

          
          if (item.fieldType == 'Tx') {
            input = createElementWithStyle('input', item);            
          }
          if (item.fieldType == 'Btn') {
            input = createElementWithStyle('input', item);
            if (item.flags & 32768) {
              input.type = 'radio';
               // radio button is not supported
            } else if (item.flags & 65536) {
              input.type = 'button';
              // pushbutton is not supported
            } else {
              input.type = 'checkbox';
            }
          }
          if (item.fieldType == 'Ch') {
            input = createElementWithStyle('select', item);
            // select box is not supported
            
            
            // dropDownControlfunction(item, viewport)
            
             if (item.options) {
                console.log('nice');
                console.log(item.options);
                console.log('fieldType ' + item.fieldType);
                
                // for(var opt in item.options) {
                //     var optObject = item.options[opt];
                    
                //     var option = document.createElement("option");
                //     option.text = optObject.text;
                //     input.add(option);    
                // }
                
                
                var itemProperties = item;
                var control = input;
                if (itemProperties.options) {
                    for (var option in itemProperties.options) {
                        var optionElement = document.createElement('option');
                        optionElement.value = itemProperties.options[option]['value'];
                        optionElement.innerHTML = itemProperties.options[option]['text'];
                        if (typeof(itemProperties.value)=='object') { // multiple selected values. To be implemented

                        }
                        else if(itemProperties.value==itemProperties.options[option]['value']) {
                            optionElement.selected=true;
                        }
                        control.appendChild(optionElement);
                    }

                }
                if (itemProperties.readOnly)
                {
                    control.disabled='disabled';
                    control.style.cursor = "not-allowed";
                }
                
                
            }
            
          }
          input.className = 'inputControl';
          input.name = item.fullName;
          input.title = item.alternativeText;
          assignFontStyle(input, item);
          bindInputItem(input, item);
          div.appendChild(input);
          break;
      }
    }
  });
}

function renderPage(div, pdf, pageNumber, callback) {
  pdf.getPage(pageNumber).then(function(page) {
    var scale = 1.5;
    var viewport = page.getViewport(scale);

    var pageDisplayWidth = viewport.width;
    var pageDisplayHeight = viewport.height;

    var pageDivHolder = document.createElement('div');
    pageDivHolder.className = 'pdfpage';
    pageDivHolder.style.width = pageDisplayWidth + 'px';
    pageDivHolder.style.height = pageDisplayHeight + 'px';
    div.appendChild(pageDivHolder);

    // Prepare canvas using PDF page dimensions
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = pageDisplayWidth;
    canvas.height = pageDisplayHeight;
    pageDivHolder.appendChild(canvas);
    
    
    

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    page.render(renderContext).promise.then(callback);

    // Prepare and populate form elements layer
    var formDiv = document.createElement('div');   
    pageDivHolder.appendChild(formDiv);
    
   
    
    // Kel..
    
    
    var textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'textLayer'; 
    // textLayerDiv.style.background = 'red';
    formDiv.appendChild(textLayerDiv);
    

    var canvasOffset = $(canvas).offset();
    var $textLayerDiv = $(textLayerDiv).css({
            height : viewport.height+'px',
            width : viewport.width+'px',
            top : 0, 
            left : 0 
        });

        
        page.getTextContent().then(function(textContent){
        var textLayer = new TextLayerBuilder({
            textLayerDiv : textLayerDiv,
            pageIndex :  pageNumber - 1,
            viewport : viewport
        });

        textLayer.setTextContent(textContent);
        console.log('text content');
        console.log( textContent);
        textLayer.render();
        
    });
    
    
    // ..Kel    


    setupForm(formDiv, page, viewport);
    

    
  });
}

// In production, the bundled pdf.js shall be used instead of RequireJS.
require.config({paths: {'pdfjs': '../../src'}});
require([
    'pdfjs/display/api',
    '../../node_modules/jquery/dist/jquery.min.js',
    '../../web/ui_utils.js',
    '../../web/text_layer_builder.js',
    'pdfjs/display/text_layer'
    ], function (api) {
        
        
        
  // In production, change this to point to the built `pdf.worker.js` file.
  PDFJS.workerSrc = '../../src/worker_loader.js';

  // Fetch the PDF document from the URL using promises.
  api.getDocument(pdfWithFormsPath).then(function getPdfForm(pdf) {
    // Rendering all pages starting from first
    var viewer = document.getElementById('viewer');
    var pageNumber = 1;
    renderPage(viewer, pdf, pageNumber++, function pageRenderingComplete() {
      if (pageNumber > pdf.numPages) {
        return; // All pages rendered
      }
      // Continue rendering of the next page
      renderPage(viewer, pdf, pageNumber++, pageRenderingComplete);
    });
  });
});
