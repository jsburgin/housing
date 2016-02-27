function HousingManager(options) {
    if (options.newStaff) {
        newStaff();
    }
}

function newStaff() {
    $('#new-staff-form').validate({
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
            $.ajax({
                url: '/staff/add',
                method: 'POST',
                dataType: 'json',
                data: {
                    firstName: $('input#firstName').val(),
                    lastName: $('input#lastName').val(),
                    email: $('input#email').val(),
                    room: $('input#room').val(),
                    position: $("#position").val(),
                    building: $("#building").val(),
                    experience: $("#experience").val(),
                    groups: $("#groups").val()
                },
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
