var $ = require("jquery")
  , Backbone = require('backbone')
  , Day = require('../collections/day')
  , Handlebars = require('handlebars')
  , Review = require('../models/review')
  , d3 = require('d3')
  , c3 = require('c3')
  , _ = require('lodash')
  , moment = require('moment')
  , Pikaday = require('pikaday');

Backbone.$ = $;

function scoreKey(year){
  return year+" Average Score";
}

function makeGauge (avg, selectorOfTarget, label) {
  var percent = Math.round(avg*10);
  var chart = c3.generate({
        bindto: selectorOfTarget,
        data: {
            columns: [
                ['% score', percent ]
            ],
            type: 'gauge',
            // onclick: function (d, i) { console.log("onclick", d, i); },
            // onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            // onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        },
        gauge: {
          label: {
             format: function(value, ratio) {
                 return value/10;
             },
             show: false // to turn off the min/max labels.
          },
        min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
        max: 100, // 100 is default
        units: '',
           width: 39 // for adjusting arc thickness
        },
        color: {
            pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.

            threshold: {
              unit: ' %', // percentage is default
              max: 100, // 100 is default
              values: [50, 60, 70, 90]
            }
        },
        size: {
          height: 200
        }
    });
  return chart;
}

function fmtYears (years) {

}

function YearChart (day, selector) {
  var self = this;
  var years = day.years;
  this.years = years;
  var descYears = day.descendingYears;
  this.descYears = descYears;
  var values = descYears.map(scoreKey);

  this.chart = c3.generate({
    bindto: selector,
    data: {
      xFormat: '%m-%d',
      json: [],
      keys: {
        x: "date",
        value: values
      },
    },
    axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: function (x) { 
              return moment(x).format('MMM Do'); 
            },
            culling: {
              max: 10
            }
          }
        },
        y: {
          max: 10,
          min: 1
        }
    }
  });
}

YearChart.prototype.loadYear = function(year, delay) {
  var self = this;
  var ms = delay || 0;
  var data = this.years[year].map(function(m){ 
    var o = {
      date: moment(m.attributes._id).format('MM-DD'),
    }
    o[scoreKey(year)] = Math.round(parseFloat(m.attributes.avgScore)*10)/10
    return o;
  });

  setTimeout(function () {
    self.chart.load({
        xFormat: '%m-%d',
        json: data,
        keys: {
          x: "date",
          value: [ scoreKey(year) ]
        }
      })
  }, ms);
}

YearChart.prototype.unloadYear = function(year, delay) {
  var self = this;
  var ms = delay || 0;

  setTimeout(function(){
    self.chart.unload([scoreKey(year)]);
  }, ms);
    
}

function TopChart (type, collection) {

  var self = this;
  var columns = [[ "name" ]];
  var x = [ "name" ];
  var artistType = (type === "artists" ? true : false);
  var selector = '.'+type+'-chart';
  var data = collection.toJSON().map(function(input){
    var out = {}
    out["scoreAvg"] = Math.round(input.scoreAvg*100)/100;
    out[input["_id"]] = input.totalReviews;
    return out;
  });
  var values = collection.toJSON().map(function(i){ return i["_id"]; })
  var range = ( artistType ? { max: 9, min: 5} : {max: 6, max: 8 });
  var score_type = ( artistType ? "Received" : "Given");

  this.chart = c3.generate({
    bindto: selector,
    data: {
      json: data,
      type: 'scatter',
      keys: {
        x: "scoreAvg",
        value: values
      }
    },
    point: {
      r: 10
    },
    axis: {
      y: {
        label: "Total Reviews"
      },
      x: {
        max: range.max,
        min: range.min,
        tick: {
          fit: true,
          centered: true
        },
        label: "Average Score "+score_type
      }
    }
  });

}

var HomeViews = {
  
  Body: Backbone.View.extend({

    initialize: function(opts){
      this.day = opts.day;
    },

    el: function() { return $('#main-container') },

    render: function() {

      this.views = {
        header: new HomeViews.Header({day: this.day}),
        contentWrapper: new HomeViews.ContentWrapper({day: this.day}),
        splash: new HomeViews.Splash({day: this.day}),
        form: new HomeViews.Form({day: this.day}),
        years: new HomeViews.Years({day: this.day}),
        artists: new HomeViews.Artists({day: this.day}),
        reviewers: new HomeViews.Reviewers({day: this.day}),
        footer: new HomeViews.Footer({day: this.day})
      }

      this.$el.append(this.views.header.render().$el);
      this.$el.append(this.views.splash.render().$el);
      this.$el.append(this.views.contentWrapper.render().$el);
      this.views.contentWrapper.$el.append(this.views.years.render().$el)
      this.views.contentWrapper.$el.append(this.views.form.render().$el)
      this.$el.append(this.views.footer.$el);

      return this;
    }

    // template: require('../../templates/body')
  
  }),

  ContentWrapper: Backbone.View.extend({

    initialize: function(opts){
      // console.log("")
      this.day = opts.day;
      this.listenTo(this.day, 'daySet', this.render.bind(this) );
    },

    className: 'content-wrapper',

    appendCovers: function() {
      var self = this;
      if (!this.day || this.day.models.length == 0) { return this; }
      if (self.album_views && self.album_views.length > 0) {
        self.album_views.forEach(function(view){ view.remove(); });
      }
      // reset views
      self.album_views = [];
      var total = this.day.models.length;

      this.day.each(function(review, idx){
        // var imgSrc = review.get('cover')
        
        var album = new HomeViews.Album({
          model: review,
          total: total,
          index: idx
        });
        album.render();
        self.album_views.push(album)
        $('.albums').append(album.$el);
        album.appendChart();
      })
    },

    render: function() {
      this.appendCovers();
      return this;
    }

  }),

  Splash: Backbone.View.extend({

    id: 'day',

    initialize: function(opts) {
      this.day = opts.day;
      this.listenTo(this.day, 'daySet', this.render.bind(this) )
    },

    className: 'splash-container',

    template: function(attrs){
      return Handlebars.compile(require('../../templates/splash')())(attrs);
    },

    render: function() {
      var avg = this.day ? this.day.getAverage() : "";
      this.$el.html(this.template({
        date: this.day.fmtDate(),
        scoreAverage: avg
      }));
      this.gauge = makeGauge(avg, '.gauge-big');
      return this;
    },

  }),

  Form: Backbone.View.extend({

    initialize: function(opts) {

    },

    id: 'subscribe',

    className: 'ribbon l-box-lrg pure-g',

    subscribe: function  (e) {

      function createSubscriber (attrs) {
        $.ajax({
          url: '/subscribers', 
          type: 'POST',
          dataType: 'json',
          data: attrs, 
          success: function (res, statusText, req) {
            console.log("res", res)
            if (res[0] && res[0].message) {
              if (res[0].message === "full") {
                handleFullSubscriberList(attrs)
              }
            }
          }
        })
      }

      function handleFullSubscriberList(attrs){
        // TODO: turn this into a modal
        alert("Full Subscriber List!");
      }

      e.preventDefault()
      var $form = $(e.target)
      var $email_input = $form.find('#email')
      var $score_threshold_input = $form.find('#score_threshold')
      var $first_name = $form.find('#first_name')
      var $last_name = $form.find('#last_name')
      var attrs = {
        "email": $email_input.val(),
        "score_threshold": $score_threshold_input.val(),
        "first_name": $first_name.val(),
        "last_name": $last_name.val()
      }
      createSubscriber(attrs)
      $email_input.val("")
      $score_threshold_input.val("")
      $first_name.val("")
      $last_name.val("")
    },

    template: require('../../templates/form'),

    render: function() {
      this.$el.html(this.template());
      this.$('.subscribe-form').bind('submit', this.subscribe)
      return this;
    },

  }),

  Years: Backbone.View.extend({

    initialize: function(opts) {
      var self = this;
      this.day = opts.day;
      this.listenTo(this.day, "yearsSet", function(){
        self.appendCharts();
      })
    },

    className: 'content',

    id: 'years',

    template: require('../../templates/years'),

    appendCharts: function() {
      var self = this;
      var totalYears = this.day.descendingYears.length;
      this.chart = new YearChart(this.day, '.years-chart');

      this.yearViews = [];
      _.each(this.day.descendingYears, function(year, idx){

        var yearView = new HomeViews.Year({ 
          yearNum: year,
          dates: self.day.years[year],
          className: "pure-u-1-"+totalYears+" year-button-"+idx,
          c3: self.chart
        });
        self.yearViews.push(yearView);
        self.$('.years-buttons').append(yearView.render().$el);
      });

      // load last year on start 
      // TODO: load more years without it looking weird

      [ 0 ].forEach(function(idx){
        var year = self.yearViews[idx]
        year.loadYear.call(year);
      });
    
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    }

  }),

  Artists: Backbone.View.extend({

    initialize: function(opts) {
      var self = this;
      this.day = opts.day;
      this.listenTo(this.day, "artistsSet", function(){
        self.appendCharts();
      })
    },

    el: function(){ return $('.artists-chart'); },

    appendCharts: function() {

      this.chart = new TopChart("artists", this.day.artists);
    
    },

    render: function() {
      // this.$el.html(this.template());
      return this;
    }

  }),

  Reviewers: Backbone.View.extend({

    initialize: function(opts) {
      var self = this;
      this.day = opts.day;
      this.listenTo(this.day, "reviewersSet", function(){
        self.appendCharts();
      })
    },

    el: function(){ return $('.reviewers-chart'); },

    appendCharts: function() {

      this.chart = new TopChart("reviewers", this.day.reviewers);
    
    },

    render: function() {
      // this.$el.html(this.template());
      return this;
    }

  }),

  Year: Backbone.View.extend({
    initialize: function(opts) {
      this.yearNum = opts.yearNum;
      this.dates = opts.dates;
      this.c3 = opts.c3;
      this.loaded = false;
    },

    className: 'year',

    tagName: 'span',

    events: {
      "click .year-button": "loadYear"
    },

    // TODO: consolidate into one method: toggleYear
    loadYear: function(e, year){
      if (this.loaded) {
        return this.unloadYear(e, year);
      }
      var year = year || this.yearNum;
      
      this.$('.year-button').addClass('selected');
      // this.c3.chart.unload();
      this.c3.loadYear(year);
      this.loaded = true;
    },

    unloadYear: function(e, year){
      if (!this.loaded) {
        return this.loadYear(e, year);
      }
      var year = year || this.yearNum;
      this.$('.year-button').removeClass('selected');
      this.c3.unloadYear(year);
      this.loaded = false;
    },

    template: function(attrs){
      return Handlebars.compile(require('../../templates/year')())(attrs);
    },

    appendChart: function() {
      var $gauge = $("<span class='pure-u-1-1 gauge-small-"+this.index+"'>");
      this.$('.album-meta-gauge').append($gauge)
      this.gauge = makeGauge(this.model.get('score'), '.gauge-small-'+this.index );
    },

    render: function() {
      this.$el.html(this.template({
        year: this.yearNum
      }));
      return this;
    }
  }),

  Header: Backbone.View.extend({

    initialize: function(opts) {

    },

    className: 'header',

    template: require('../../templates/partials/_header'),

    render: function() {
      this.$el.html(this.template());
      return this;
    },

  }),

  Footer: Backbone.View.extend({

    initialize: function(opts) {

    },

    className: 'footer l-box is-center',

    template: require('../../templates/partials/_footer'),

    render: function() {
      this.$el.html(this.template());
      return this;
    },

  }),

  Album: Backbone.View.extend({

    initialize: function(opts) {
      this.total = opts.total || 0;
      this.index = opts.index || 0;
    },

    model: Review,

    className: 'album',

    template: function(attrs){
      return Handlebars.compile(require('../../templates/album')())(attrs);
    },

    appendChart: function() {
      var $gauge = $("<span class='pure-u-1-1 gauge-small-"+this.index+"'>");
      this.$('.album-meta-gauge').append($gauge)
      this.gauge = makeGauge(this.model.get('score'), '.gauge-small-'+this.index );
    },

    render: function() {
      this.$el.html(this.template({
        title: this.model.get('album'),
        artist: this.model.get('artist'),
        author: this.model.get('author')
      }));
      this.$el.addClass("pure-u-1-"+this.total);
      var $link = $('<a href="http://www.pitchfork.com'+this.model.get('url')+'" target="_blank"></>');
      var $img = $("<img class='pure-u-1-1 cover'src='"+this.model.get('cover')+"'/>");
      $link.append($img);
      this.$('.album-meta-cover').append($link);
      
      return this;
    }
  })

}

module.exports = HomeViews;