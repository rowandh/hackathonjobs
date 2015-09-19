var React = require('react');
var marked = require('marked');
window.React = React;
window.marked = marked;

var Event = React.createClass({
	render: function() {
		return (
			<div className="event">
				<img src={this.props.imageUrl} />
				<h2 className="title">
					{this.props.title}
				</h2>
			</div>
		);
	}
});

var EventList = React.createClass({
	render: function() {
		var eventNodes = this.props.events.map(function(item) {
			console.log(item);
			return (
				<Event title={item.title} imageUrl={item.imageUrl}>
				</Event>
			);
		});
		return (
			<div className="eventList">
				{eventNodes}
			</div>
		);
	}
});

var EVENTS = [
	{title: 'Hackagong 2015', imageUrl: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpf1/v/t1.0-1/p160x160/11934999_716676735142550_3023888950522355416_n.png?oh=ffcfefb8e14136ea9c30d30b5f00acc7&oe=56A1099A&__gda__=1452642940_ca7d5eb28673bd6679b91cc4dfe90389'},
	{title: 'Startup Weekend 2015', imageUrl: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xft1/v/t1.0-1/p160x160/10690028_10152676775049099_7315333305313407833_n.png?oh=82da97ffc72c7a51f02b6ba3f4855887&oe=56A1CA41&__gda__=1449792876_a46399282ee01655e85f463b4f9bcedb'}
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
    <EventList events={EVENTS} />,
    document.getElementById('content')
);