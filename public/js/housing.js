function HousingManager(options) {

    if (options.newStaff) {
        staffFrom('add');
    }

    if (options.editStaff) {
        staffForm('edit');
    }

    if (options.eventCreate) {
        eventForm();
    }

    if (options.calendar) {
        calendar();
    }
}

function eventForm() {

    function setLinkToggles(container) {
        $(container).find('.toggle-link').click(function(e) {
            console.log('clicked');
            var parent = $(this).parents('.form-group'),
                checkboxes = parent.find('.event-checkbox');

            if (parent.attr('checkToggleValues') == 'true') {
                checkboxes.prop('checked', false);
                parent.attr('checkToggleValues', 'false');
            } else {
                checkboxes.prop('checked', true);
                parent.attr('checkToggleValues', 'true');
            }

            e.preventDefault();
        });
    }

    setLinkToggles('#primary-schedule-block');

    var scheduleBlockCount = 2;

    var scheduleBlockTemplate = $('#primary-schedule-block').clone();
    $(scheduleBlockTemplate).find('.exp-radio').removeAttr('name');
    $(scheduleBlockTemplate).removeAttr('id');
    $(scheduleBlockTemplate).find('.panel-options')
        .append('<a href="#" class="no-outline" data-rel="close" tabindex="-1"><i class="entypo-cancel"></i></a>');

    function getNewScheduleBlock() {
        var newBlock = scheduleBlockTemplate.clone();
        $(newBlock).find('.exp-radio').attr('name', 'exp' + scheduleBlockCount);
        setLinkToggles(newBlock);
        scheduleBlockCount++;
        return newBlock;
    }

    $('.add-schedule-block').click(function() {
        $(this).parent().before(getNewScheduleBlock());
    });


    $('.event-form-submit').click(submitEvent);

    function submitEvent(e) {
        var event = {
            title: $('#title').val(),
            description: $('#description').val(),
            date: $('#date').val(),
            staff: $('#staff').val(),
            instances: []
        };

        $.each($('.schedule-block'), function(index, block) {
            var instance = {
                startTime: $(block).find('.startTime').val(),
                endTime: $(block).find('.endTime').val(),
                location: $(block).find('.location').val(),
                experience: 2,
                positions: [],
                buildings: [],
                groups: []
            };

            if ($(block).find('.new-staff').is(':checked')) {
                instance.experience = 0;
            } else if ($(block).find('.returning-staff').is(':checked')) {
                instance.experience = 1;
            }

            var toFind = ['positions', 'buildings', 'groups'];

            for (var i = 0; i < toFind.length; i++) {
                var type = toFind[i];

                $.each($(block).find('.' + type + '-checkbox'), function(index, checkbox) {
                    if (checkbox.checked) {
                        instance[type].push($(checkbox).val());
                    }
                });
            }


            event.instances.push(instance);
        });

        $.ajax({
            url: '/add',
            method: 'POST',
            dataType: 'json',
            data: event,
            error: function(error) {
                console.log(error);
            },
            success: function(response) {
                window.location.href = '/';
            }
        });

        e.preventDefault();
    }
}

function calendar() {
    var calendar = $('#calendar');

    $.ajax({
        url: '/api/eventHeaders',
        method: 'GET',
        error: function(err) {
            console.log(err)
        },
        success: function(response) {
            var eventHeaders = [];
            for (var i = 0; i < response.length; i++) {
                var event = {
                    title: response[i].title,
                    start: new Date(response[i].date + ' ' + response[i].startTime),
                    end: new Date(response[i].date + ' ' + response[i].endTime),
                    id: response[i].linkingId,
                    backgroundColor: '#AB2D4E',
                    borderColor: '#AB2D4E',
                    allDay: false
                };

                eventHeaders.push(event);
            }

            renderCalendar(eventHeaders);
        }
    });

    function renderCalendar(eventHeaders) {
        calendar.fullCalendar({
            header: {
                left: 'title',
                right: 'month,agendaWeek,agendaDay today prev,next'
            },
            editable: false,
            firstDay: 1,
            defaultDate: new Date().toString(),
            editable: false,
            eventLimit: true,
            fixedWeekCount: false,
            height: 600
        });

        for (var i = 0; i < eventHeaders.length; i++) {
            console.log(eventHeaders[i].start);
            console.log(eventHeaders[i].end);
            calendar.fullCalendar('renderEvent', eventHeaders[i], false);
        }
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
