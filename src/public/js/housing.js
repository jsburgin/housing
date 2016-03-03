function HousingManager(options) {

    if (options.newStaff) {
        staffForm('add');
    }

    if (options.editStaff) {
        staffForm('edit');
    }

    if (options.eventCreate) {
        eventForm({});
    } else if (options.eventEdit) {
        eventForm({ update: true, linkingId: options.linkingId });
    }

    if (options.calendar) {
        calendar();
    }
}

function eventForm(options) {

    function setLinkToggles(container) {

        $(container).find('.toggle-link').click(function(e) {
            console.log('clicked');
            var parent = $(this).parents('.form-group'),
                checkboxes = parent.find('.event-checkbox');

            var checked = parent.find('.event-checkbox:checked').length;

            if (checked > checkboxes.length / 2) {
                checkboxes.prop('checked', false);
                parent.attr('checkToggleValues', 'false');
            } else {
                checkboxes.prop('checked', true);
                parent.attr('checkToggleValues', 'true');
            }

            e.preventDefault();
        });

        $(container).find('.timepicker').each(initTimePickers);
    }

    setLinkToggles('#primary-schedule-block');

    var scheduleBlockCount = 2;

    // keep empty clone in memory for easy re-cloning
    var scheduleBlockTemplate = $('#primary-schedule-block').clone();

    if (options.update) {
        scheduleBlockTemplate.find('input[type="checkbox"]').prop('checked', false);
        scheduleBlockTemplate.find('.location').val('');
        scheduleBlockTemplate.find('.startTime').val('12:00 PM');
        scheduleBlockTemplate.find('.endTime').val('12:00 PM');
    }

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

        var url = '/add';

        if (options.update) {
            event.linkingId =  options.linkingId;
            url = '/edit';
        }

        $.ajax({
            url: url,
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
            height: 600,
            eventClick: function(eventData) {
                return window.location.replace('/edit?id=' + eventData.id);
            }
        });

        for (var i = 0; i < eventHeaders.length; i++) {
            calendar.fullCalendar('renderEvent', eventHeaders[i], true);
        }
    }
}

function staffForm(type) {
    $('#staff-form').validate({
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

function initTimePickers(i, el) {
    var $this = $(el),
        opts = {
            template: attrDefault($this, 'template', false),
            showSeconds: attrDefault($this, 'showSeconds', false),
            defaultTime: attrDefault($this, 'defaultTime', 'current'),
            showMeridian: attrDefault($this, 'showMeridian', true),
            minuteStep: attrDefault($this, 'minuteStep', 15),
            secondStep: attrDefault($this, 'secondStep', 15)
        },
        $n = $this.next(),
        $p = $this.prev();

    $this.timepicker(opts);
}
