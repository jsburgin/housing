var expect = require('chai').expect;

var timeFormatter = require('../src/timeformatter');
var Event = require('../src/models/event');
var generator = require('../src/generator');

describe('timeFormatter.getTimeString()', function() {
    it("should covert am/pm string to 24 hour string", function() {

        expect(timeFormatter.getTimeString('9:00 AM')).to.equal('09:00');
        expect(timeFormatter.getTimeString('1:00 PM')).to.equal('13:00');
        expect(timeFormatter.getTimeString('12:00 PM')).to.equal('12:00');
        expect(timeFormatter.getTimeString('12:00 AM')).to.equal('00:00');

    });
});


describe('Event.buildEvents()', function() {

    var linkingId = 'g6bda4j98jqc';
    var rawEventData = {
        title: 'Lunch',
        date: 'Wed March 2, 2016',
        staff: 'All Staff',
        description: "#TEAMHRC2016",
        instances: [
            {
                location: 'Lakeside',
                startTime: '11:00 AM',
                endTime: '12:00 PM',
                positions: ['0', '1'],
                buildings: ['12', '15', '2'],
            }
        ]
    };

    it("should create an eventHeader and sub events", function() {

        Event.buildEvents(linkingId, rawEventData, function(err, eventHeader, events) {
            expect(eventHeader.title).to.equal('Lunch');
            expect(eventHeader.location).to.equal('Lakeside');
            expect(eventHeader.date).to.equal('2016-03-02');
            expect(eventHeader.startTime).to.equal("11:00");
            expect(eventHeader.endTime).to.equal("12:00");
            expect(eventHeader.description).to.equal('#TEAMHRC2016');
            expect(eventHeader.staff).to.equal('All Staff');

            expect(events.length).to.equal(1);
            expect(events[0].collection).to.equal('events');
            expect(events[0].data.title).to.equal('Lunch');
            expect(events[0].data.buildings).to.eql([12, 15, 2]);
            expect(events[0].data.groups).to.eql([]);
            expect(events[0].data.positions).to.eql([0, 1]);
        });

        rawEventData.instances.push({
            location: 'Burke',
            startTime: '9:00 AM',
            endTime: '10:00 AM',
            positions: ['3'],
            groups: ['1']
        });

        Event.buildEvents(linkingId, rawEventData, function(err, eventHeader, events) {
            expect(events.length).to.equal(2);
            expect(eventHeader.startTime).to.equal("09:00");
            expect(eventHeader.endTime).to.equal("12:00");
            expect(eventHeader.location).to.equal('Conditional');

            expect(events[0].data.location).to.equal('Lakeside');
            expect(events[1].data.location).to.equal('Burke');
            expect(events[1].data.positions).to.eql([3]);
            expect(events[1].data.buildings).to.eql([]);
        });
    });

});

describe('generator.generateKey()', function() {

    it('should return a string of random chars and ints', function() {
        var key = generator.generateKey(12);

        expect(key).to.be.a('string');
        expect(key.length).to.equal(12);
        expect(key.indexOf(" ")).to.equal(-1);
    });

});
