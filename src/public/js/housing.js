function HousingManager(options) {
    this.options = options;

    if (options) {
        if (options.settings) {
            this.settingsPage();
        }
    }
};

HousingManager.prototype.approveUser = function() {
    $('.approve-user').click(function(e) {
        let id = $(e.currentTarget).attr('admin-id');

        $.ajax({
            url: '/account/approve',
            method: 'POST',
            dataType: 'json',
            data: { id: id },
            success: function() {
                $(e.currentTarget).parents('.approve-tabledata').html('Approved');
            },
            error: function() {
                console.log('Unable to approve user.');
            }
        });

        return false;
    });
}

HousingManager.prototype.registerForm = function() {

    var registerForm = $('#form_register');

    registerForm.validate({
        rules: {
            firstname: {
                required: true
            },
            lastname: {
                required: true
            },
            email: {
                required: true
            },
            password: {
                required: true
            }
        },
        messages: {
            email: {
                email: 'Invalid email address.'
            }
        },
        highlight: function(element) {
            $(element).closest('.input-group').addClass('validate-has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.input-group').removeClass('validate-has-error');
        },
        submitHandler: function() {
            $('.login-page').addClass('logging-in');

            $.ajax({
                url: '/account/register',
                method: 'POST',
                dataType: 'json',
                data: {
                    firstname: $('input#firstname').val(),
                    lastname: $('input#lastname').val(),
                    email: $('input#email').val(),
                    password: $('input#password').val()
                },
                success: function() {
                    console.log('success');
                },
                error: function() {
                    console.log('error');
                }
            });
        }
    });
}

HousingManager.prototype.settingsPage = function() {
    $('#remove-events-button').click(function(e) {
        $('#remove-events-modal').modal('show');
        e.preventDefault();
    });

    this.approveUser();

    $('#remove-all-button').click(function(e) {

        $.ajax({
            method: 'POST',
            url: '/settings/remove/events',
            data: {},
            failure: function(err) {
                console.log(err);
            },
            success: function(response) {
                $('#remove-events-modal').modal('hide');
            }
        });

        e.preventDefault();
    });
};

HousingManager.prototype.eventForm = function eventForm(options) {

    // starting index for all new scheduling blocks
    var blockCount = 3;

    // keep empty scheduling block clones in memory for easy re-cloning
    var scheduleBlockTemplate = $('#primary-schedule-block').clone();
    var cdBlockTemplate = $('#primary-cd-schedule-block').clone();
    $('#primary-schedule-block').remove();
    $('#primary-cd-schedule-block').remove();
    scheduleBlockTemplate.css('display', 'block');
    cdBlockTemplate.css('display', 'block');
    stripBlocksOfUniqueData(scheduleBlockTemplate);
    stripBlocksOfUniqueData(cdBlockTemplate);

    $('.schedule-block').css('display', 'block');
    $('.cd-schedule-block').css('display', 'block');
    $('.select2').select2();

    // removes ids and names from base scheduling blocks
    function stripBlocksOfUniqueData(newBlock) {
        // clears the clone's radio buttons' names as they will become dynamic
        newBlock.find('.exp-radio').removeAttr('name');
        // remove the id of the clone
        newBlock.removeAttr('id');
        newBlock.find('.panel-options')
            .append('<a href="#" class="no-outline" data-rel="close" tabindex="-1"><i class="entypo-cancel"></i></a>');
    }

    // Triggers when a new scheduling block is added, collapses existing blocks and adds informative title
    // @ [building] from [startTime] to [endTime]
    function setTitleAndCollapsePanels() {
        $.each($('.panel'), function(index, panel) {
            panel = $(panel);

            var body = panel.children('.panel-body, .table');

            body.slideUp('normal');
            panel.addClass('panel-collapse');

            var infoBlock = panel.find('.event-info');
            var location = panel.find('.location').val();
            var startTime = panel.find('.startTime').val();
            var endTime = panel.find('.endTime').val();

            var info = ' &middot; <span class="bold">'
                + '@ ' + location
                + ' from ' + startTime + ' to ' + endTime
                + '</span>';

            infoBlock.html(info);
        });
    }

    // Presets a block's startTime, endTime, and staff when necessary
    // dependant on global 'Staff' input, and previous block's starting and end times
    function preloadEvent(newBlock) {
        var staffType = $('#staff').val();

        switch(staffType) {
            case 'All Staff':
                newBlock.find('.positions-checkbox').prop('checked', true);
                break;
            case 'New CDs':
                newBlock.find('.exp-radio[value=0]').prop('checked', true);
                newBlock.find('.positions-checkbox[value=1]').prop('checked', true);
                break;
            case 'New FAs':
                newBlock.find('.exp-radio[value=0]').prop('checked', true);
                newBlock.find('.positions-checkbox[value=2]').prop('checked', true);
                break;
            case 'New RAs':
                newBlock.find('.exp-radio[value=0]').prop('checked', true);
                newBlock.find('.positions-checkbox[value=3]').prop('checked', true);
                break;
            case 'CDs':
                newBlock.find('.positions-checkbox[value=1]').prop('checked', true);
                break;
            case 'FAs':
                newBlock.find('.positions-checkbox[value=2]').prop('checked', true);
                break;
            case 'RAs':
                newBlock.find('.positions-checkbox[value=3]').prop('checked', true);
                break;
            case 'FAs and RAs':
                newBlock.find('.positions-checkbox[value=2]').prop('checked', true);
                newBlock.find('.positions-checkbox[value=3]').prop('checked', true);
                break;
            case 'New FAs and RAs':
                newBlock.find('.positions-checkbox[value=2]').prop('checked', true);
                newBlock.find('.positions-checkbox[value=3]').prop('checked', true);
                newBlock.find('.exp-radio[value=0]').prop('checked', true);
                break;
            case 'Returning FAs and RAs':
                newBlock.find('.positions-checkbox[value=2]').prop('checked', true);
                newBlock.find('.positions-checkbox[value=3]').prop('checked', true);
                newBlock.find('.exp-radio[value=1]').prop('checked', true);
                break;
            case 'Returning CDs':
                newBlock.find('.positions-checkbox[value=1]').prop('checked', true);
                newBlock.find('.exp-radio[value=1]').prop('checked', true);
                break;
            case 'Returning FAs':
                newBlock.find('.positions-checkbox[value=2]').prop('checked', true);
                newBlock.find('.exp-radio[value=1]').prop('checked', true);
                break;
            case 'Returning RAs':
                newBlock.find('.positions-checkbox[value=3]').prop('checked', true);
                newBlock.find('.exp-radio[value=1]').prop('checked', true);
                break;
        }

        if ($('.panel').length > 0) {
            var startTime = $('.panel').last().find('.startTime').val();
            var endTime = $('.panel').last().find('.endTime').val();

            $(newBlock).find('.startTime').val(startTime);
            $(newBlock).find('.endTime').val(endTime);
        }

        $(newBlock).find('.exp-radio').attr('name', 'exp' + blockCount);
        blockCount++;
        setLinkToggles(newBlock);
    }

    // Adds functionality to the 'Toggle All' links for staff, buildings, or groups
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

    // creates a new schedule block
    function getNewScheduleBlock() {
        var newBlock = scheduleBlockTemplate.clone();

        preloadEvent(newBlock);
        return newBlock;
    }

    // creates a new cd schedule block
    function getNewCDBlock() {
        var newBlock = cdBlockTemplate.clone();
        preloadEvent(newBlock);

        newBlock.find('.select2').select2();
        return newBlock;
    }

    $('.add-schedule-block').click(function() {
        setTitleAndCollapsePanels();
        $(this).parent().before(getNewScheduleBlock());
        $("html, body").animate({ scrollTop: $(document).height() }, 1200);
    });

    $('.add-cd-schedule-block').click(function() {
        setTitleAndCollapsePanels();
        $(this).parent().before(getNewCDBlock());
        $("html, body").animate({ scrollTop: $(document).height() }, 1200);
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

            // loop over all three types of checkboxes
            for (var i = 0; i < toFind.length; i++) {
                var type = toFind[i];

                // loop over each checkbox of a type
                $.each($(block).find('.' + type + '-checkbox'), function(index, checkbox) {
                    if (checkbox.checked) {
                        instance[type].push($(checkbox).val());
                    }
                });
            }

            event.instances.push(instance);
        });

        $.each($('.cd-schedule-block'), function(index, block) {

            var instance = {
                byCD: true,
                startTime: $(block).find('.startTime').val(),
                endTime: $(block).find('.endTime').val(),
                location: $(block).find('.location').val(),
                experience: 2,
                positions: [],
                cds: $(block).find('select.cd-selector').val()
            }

            if ($(block).find('.new-staff').is(':checked')) {
                instance.experience = 0;
            } else if ($(block).find('.returning-staff').is(':checked')) {
                instance.experience = 1;
            }

            $.each($(block).find('.positions-checkbox'), function(index, checkbox) {
                if (checkbox.checked) {
                    instance.positions.push($(checkbox).val());
                }
            });

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

        console.log(event);

        e.preventDefault();
    }
};

HousingManager.prototype.notifications = function notifications() {
    $('.notification-form').find('.toggle-link').click(function(e) {
        var parent = $(this).parents('.form-group'),
            checkboxes = parent.find('.notification-checkbox');

        var checked = parent.find('.notification-checkbox:checked').length;

        if (checked > checkboxes.length / 2) {
            checkboxes.prop('checked', false);
            parent.attr('checkToggleValues', 'false');
        } else {
            checkboxes.prop('checked', true);
            parent.attr('checkToggleValues', 'true');
        }

        e.preventDefault();
    });

    $('.notification-send').click(function(e) {

        var message = {
            message: $('#message').val(),
            buildings: [],
            groups: [],
            positions: [],
            experience: 2
        };

        var toFind = ['positions', 'buildings', 'groups'];

        for (var i = 0; i < toFind.length; i++) {
            var type = toFind[i];

            $.each($('.notification-form').find('.' + type + '-checkbox'), function(index, checkbox) {
                if (checkbox.checked) {
                    message[type].push($(checkbox).val());
                }
            });
        }

        if ($('.notification-form').find('.new-staff').is(':checked')) {
                message.experience = 0;
            } else if ($('.notification-form').find('.returning-staff').is(':checked')) {
                message.experience = 1;
            }

        $.ajax({
            url: '/notifications/send',
            method: 'POST',
            dataType: 'json',
            data: message,
            error: function(err) {
                console.log(err);
            },
            success: function(response) {
                window.location.href = '/notifications';
            }
        });

        e.preventDefault();
    });
};

HousingManager.prototype.calendar = function calendar() {
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
                    backgroundColor: '#9e1b32',
                    borderColor: '#9e1b32',
                    allDay: false
                };

                eventHeaders.push(event);
            }

            renderCalendar(eventHeaders);
        }
    });

    function renderCalendar(eventHeaders) {

        var calendarInfo = {
            customButtons: {
                addEvent: {
                    text: 'Add Event',
                    click: function() {
                        window.location.href = '/add';
                    }
                }
            },
            buttonText: {
                today: 'Today',
                month: 'Month',
                day: 'Day',
                week: 'Week'
            },
            header: {
                left: 'title',
                right: 'addEvent month,agendaWeek,agendaDay prev,next'
            },
            editable: false,
            defaultDate: new Date().toString(),
            editable: false,
            eventLimit: true,
            aspectRatio: 2,
            eventClick: function(eventData) {
                return window.location.replace('/edit?id=' + eventData.id);
            }
        };

        if (docCookies.getItem('startDate')) {
            calendarInfo.defaultDate = moment(docCookies.getItem('startDate'));
        }

        calendar.fullCalendar(calendarInfo);

        $(document).ready(function() {
            $('.fc-next-button').click(setStartCookie);
            $('.fc-prev-button').click(setStartCookie);

            function setStartCookie() {
                docCookies.setItem('startDate', calendar.fullCalendar('getDate').format('YYYY-MM-DD'));
            }
        });

        for (var i = 0; i < eventHeaders.length; i++) {
            calendar.fullCalendar('renderEvent', eventHeaders[i], true);
        }

    }
};

HousingManager.prototype.staffForm = function staffForm(type) {

    $('#position').select2().on('change', function(e) {
        if ($(e.currentTarget).val() == 1) {
            $('.cd-selector-container').css('display', 'none');
        } else {
            $('.cd-selector-container').css('display', 'block');
        }
    });

    var selectors = ['#building', '#groups', '#experience', '#cd'];

    for (var i = 0; i < selectors.length; i++) {
        $(selectors[i]).select2();
    }

    if ($('#position').val() == 1) {
        $('.cd-selector-container').css('display', 'none');
    }

    $('#staff-form').validate({
        highlight: function(element) {
            $(element).closest('.input-group').addClass('validate-has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.input-group').removeClass('validate-has-error');
        },
        submitHandler: function(env) {
            var data = {
                firstname: $('input#firstName').val(),
                lastname: $('input#lastName').val(),
                email: $('input#email').val().toLowerCase(),
                room: $('input#room').val(),
                position: $("#position").val(),
                building: $("#building").val(),
                experience: $("#experience").val(),
                groups: $("#groups").val(),
                cd: $('#cd').val()
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
};

HousingManager.prototype.editSchedule = function() {
    $('#schedule-update-form').validate({
        submitHandler: function(env) {

            var data = {
                title: $('#title').val(),
                startDate: $('#housing-date-picker').html().split('-')[0],
                endDate: $('#housing-date-picker').html().split('-')[1],
                description: $('textarea[name="description"]').val()
            };

            $.ajax({
                url: '/schedule',
                method: 'POST',
                dataType: 'json',
                data: data,
                error: function(error) {
                    console.log(error);
                },
                success: function(response) {

                    console.log('called');

                    window.location.href = '/';
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

