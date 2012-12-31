$(document).ready(function() {

	function requestChatterFeed() {
	    $.ajax({
		url: '/feed',
		success: function(data) {
			blah=data;
			 for (var item in data) {
				var post = document.createElement('div');
				post.className = (data[item].me=="yes") ? 'triangle-right my-post' : 'triangle-right top your-post';
			
				var from = document.createElement('div');
				from.className = 'post-from';
				from.appendChild(document.createTextNode(data[item].name));
			
				var time = document.createElement('div');
                                time.className = 'post-time';
				var abbr = document.createElement('abbr');
				abbr.className = 'timeago';
				abbr.title = data[item].createdDate;
				var time_display = new Date(data[item].createdDate).toString("MMM dd @ HH:mm tt");
                                abbr.appendChild(document.createTextNode(time_display));
				time.appendChild(abbr);
				/*$("abbr.timeago").timeago();*/ //Cris doesn't like this
	
				var details = document.createElement('div');
				details.className = 'post-details';
				details.appendChild(document.createTextNode(data[item].text));

				post.appendChild(from);
				post.appendChild(time);
				post.appendChild(details);

				$("#chatter_container").append(post);	
			 }


		},
		cache: false
	    });
	}

	requestChatterFeed();

});
