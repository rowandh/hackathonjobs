var React = require('react');
var marked = require('marked');
var BackBone = require('backbone');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Link = ReactRouter.Link;
window.React = React;
window.marked = marked;
window.Router = Router;
window.Route = Route;
window.Link = Link;

var Router = React.createClass({
	getInitialState: function() {
		return {
			component: <EventList events={EVENTS} />
		};
	},
	componentDidMount: function() {
		var self = this;

		var Router = BackBone.Router.extend({
			routes: {
				'': 'all',
				'events': 'events',
				'comments': 'comments'
			},
			all: function () {
				self.setState({ 
					component: <EventList events={EVENTS} />
				}); 
			},
			events: function () {
				self.setState({
					component: <EventList events={EVENTS} />
				});
			},
			comments: function () {
				self.setState({
					component: <CommentBox 
						url={"comments.json"} 
						pollInterval={2000} />
				});
			}
		});

		new Router();
		BackBone.history.start();
	},
	render: function() {
		return this.state.component;
	}
});

var EventListItem = React.createClass({
	render: function() {
		return (
			<div className="event">
				<img src={this.props.imageUrl} />
				<h2 className="title">
					{this.props.title} [{this.props.id}]
				</h2>
				<button className="register">Register</button>
			</div>
		);
	}
});

var EventList = React.createClass({
	render: function() {
		var eventNodes = this.props.events.map(function(item) {
			console.log(item);
			return (
				<EventListItem 
					title={item.title} 
					imageUrl={item.imageUrl} 
					id={item.id}>
				</EventListItem>
			);
		});
		return (
			<div className="eventList">
				{eventNodes}
			</div>
		);
	}
});

var EventDetail = React.createClass({
	render: function() {
		var attendeeNodes = this.props.attendees.map(function(attendee) {
			console.log(attendee);
			return (
				<EventDetailAttendee name={attendee.name}>
				</EventDetailAttendee>
			);
		});
		return (
			<div className="eventDetail">

			</div>
		);
	}
});

var EventDetailAttendee = React.createClass({
	render: function() {
		return (
			<div className="eventDetailAttendee">
				{this.props.name}
			</div>
		);
	}
});

var EVENTS = [
	{id: 1, title: 'Hackagong 2015', imageUrl: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpf1/v/t1.0-1/p160x160/11934999_716676735142550_3023888950522355416_n.png?oh=ffcfefb8e14136ea9c30d30b5f00acc7&oe=56A1099A&__gda__=1452642940_ca7d5eb28673bd6679b91cc4dfe90389'},
	{id: 2, title: 'Startup Weekend 2015', imageUrl: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xft1/v/t1.0-1/p160x160/10690028_10152676775049099_7315333305313407833_n.png?oh=82da97ffc72c7a51f02b6ba3f4855887&oe=56A1CA41&__gda__=1449792876_a46399282ee01655e85f463b4f9bcedb'}
];

var EVENT_ATTENDEES = [
	{event_id: 1, attendees: [1,2]},
	{event_id: 2, attendees: [2]}
];

var USERS = [
	{id: 1, name: 'Test Guy', description: '.NET dev'},
	{id: 2, name: 'Test Girl', description: 'Front-end guru'}
];

var TAGS = [
	{user_id: 1, tags: ['c#', '.net']},
	{user_id: 2, tags: ['javascript', 'react']}
];

  var CommentBox = React.createClass({
    loadCommentsFromServer: function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        cache: false,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
        	console.log(this.props.url);
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
    handleCommentSubmit: function(comment) {
      var comments = this.state.data;
      var newComments = comments.concat([comment]);
      this.setState({data: newComments});
      
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: comment,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
    getInitialState: function() {
      return {data: []};
    },
    componentDidMount: function () {
      this.loadCommentsFromServer();
      setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
      return (
        <div className="commentBox">
          <h1>Comments</h1>
          <CommentList data={this.state.data}/>
          <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
        </div>
      );
    }
  });
  
  var CommentList = React.createClass({
    render: function() {
      var commentNodes = this.props.data.map(function (comment) {
        return (
            <Comment author={comment.author}>
              {comment.text}
            </Comment>
          );
      });

      return (
        <div className="commentList">
          {commentNodes}
        </div>
      );
    }
  });
  
  var Comment = React.createClass({
    render: function () {
      var rawMarkup =  marked(this.props.children.toString(),  { sanitize: true });

      return (
        <div className="comment">
          <h2 className="commentAuthor">
            {this.props.author}
          </h2>
          <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
        </div>
        );
    }
  });

  var CommentForm = React.createClass({
    handleSubmit: function(e) {
      e.preventDefault();
      var author = React.findDOMNode(this.refs.author).value.trim();
      var text = React.findDOMNode(this.refs.text).value.trim();
      
      if (!text || !author) return;

      this.props.onCommentSubmit({author: author, text: text});
      React.findDOMNode(this.refs.author).value = '';
      React.findDOMNode(this.refs.text).value = '';
      return;
    },
    render: function() {
      return (
          <form className="commentForm" onSubmit={this.handleSubmit}>
            <input type="text" placeholder="Your name" ref="author"/>
            <input type="text" placeholder="Say something..." ref="text"/>
            <input type="submit" value="Post" />
          </form>
        );
    }

  });
  
React.render(
    <Router>
    	<Route path="/" component={EventList} />
    	<Route path="/comments" component={CommentBox} />
    </Router>,
    document.getElementById('content')
);