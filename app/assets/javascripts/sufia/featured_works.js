function setWeight(node, weight) {
  weightField(node).val(weight);
}

/* find the input element with data-property="order" that is nested under the given node */
function weightField(node) {
  return findProperty(node, "order");
}

function findProperty(node, property) {
  return node.find("input[data-property=" + property + "]");
}

function findNode(id, container) {
  return container.find("[data-id="+id+"]");
}

function dragAndDrop(selector) {
  selector.nestable({maxDepth: 1});
  selector.on('change', function(event) {
    // Scope to a container because we may have two orderable sections on the page
    container = $(event.currentTarget);
    var data = $(this).nestable('serialize')
    var weight = 0;
    for(var i in data){
      var parent_id = data[i]['id'];
      parent_node = findNode(parent_id, container);
      setWeight(parent_node, weight++);
    }
  });
}

Blacklight.onLoad(function() {
  $('#content-wrapper').on('click', 'a[data-behavior="feature"]', function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    anchor = $(this);
    $.ajax({
       url: anchor.attr('href'),
       type: "post",
       success: function(data) {
         anchor.before('<a data-method="post" data-behavior="unfeature-page" href="'+anchor.attr('href')+'">Unfeature</a>');
         anchor.remove();
       }
    });
  });

  $('#content-wrapper').on('click', 'a[data-behavior="unfeature-page"]', function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    anchor = $(this);
    $.ajax({
       url: anchor.attr('href'),
       type: "post",
       data: {"_method":"delete"}, 
       success: function(data) {
         anchor.before('<a data-method="post" data-behavior="feature" href="'+anchor.attr('href')+'">Feature</a>');
         anchor.remove();
       }
    });
  });


  $('#content-wrapper').on('click', 'a[data-behavior="unfeature"]', function(evt) {
    evt.preventDefault();
    anchor = $(this);
    $.ajax({
       url: anchor.attr('href'),
       type: "post",
       data: {"_method":"delete"}, 
       success: function(data) {
         row = anchor.closest('li')
         row.fadeOut(1000, function() {
           row.remove();
         });
       }
    });
  });

  dragAndDrop($('#dd'));
});
