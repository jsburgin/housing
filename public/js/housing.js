function HousingManager(options) {
    if (options.newStaff) {
        staffFrom('add');
    }

    if (options.editStaff) {
        staffForm('edit');
    }
}

function staffForm(type) {
    $('#staff-form').validate({
        rules: {
            firstName: {
                required: true
            },
            lastName: {
                required: true
            },
            email: {
                required: true
            },
            room: {
                required: true
            },
            position: {
                required: true
            },
            building: {
                required: true
            },
            experience: {
                required: true
            }
        },
        highlight: function(element) {
            $(element).closest('.input-group').addClass('validate-has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.input-group').removeClass('validate-has-error');
        },
        submitHandler: function(env) {
            var data = {
                firstName: $('input#firstName').val(),
                lastName: $('input#lastName').val(),
                email: $('input#email').val(),
                room: $('input#room').val(),
                position: $("#position").val(),
                building: $("#building").val(),
                experience: $("#experience").val(),
                groups: $("#groups").val()
            };

            if (type == 'edit') {
                data.id = $('#userid').val();
            }

            $.ajax({
                url: '/staff/' + type,
                method: 'POST',
                dataType: 'json',
                data: data,
                error: function(error) {
                    console.log(error);
                },
                success: function(response) {
                    window.location.href = '/staff';
                }
            });
        }
    });
}
