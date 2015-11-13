/*
todo:
- tracking user behaviours
	- user ips
	- user page tracking stuff
	- other (device + location)

*/



$(document).ready(function(){

	var state = 0;
	var header_state = 0;
	var logged_state = 3;
	var container = $("#content-container");
	var header_container = $("#header");
	var current_user = null;
	var viewing_user = null;
	var clientSideUsersList = [];
	
	if (sessionStorage.state){
		state = parseInt(sessionStorage.getItem('state'));
		header_state = parseInt(sessionStorage.getItem('header_state'));
		current_user = JSON.parse(sessionStorage.getItem('current_user'));
		viewing_user = JSON.parse(sessionStorage.getItem('viewing_user'));
		clientSideUsersList = JSON.parse(sessionStorage.getItem('clientSideUsersList'));
		showStates();
	}else{
			
		$.ajax({
			url: "/getAllUsers",
			type: 'GET',
			contentType: 'application/json',
			success: function(data){
				clientSideUsersList = data;
			}
		});
		
		showStates();	
		
	}
	
	$("#login-butt").click(function(){
		state = 1;
		showStates();
	});
	
	$("#register-butt").click(function(){
		state = 2;
		showStates();
	});
	
	$("#register-butt-rg").click(function(){
		var isEmpty = false;
		var container_children = $(this).parent().children();
		container_children.each(function(){
			if ($(this).val() == "" && $(this).is("input")){
				isEmpty = true;
			}
		});
		
		var samePass = $("#password-field-rg").val() == $("#cfm-password-field-rg").val();
		var takenUser = false;
		for (j=0;j<clientSideUsersList.length;j++){
			if (clientSideUsersList[j].email == $("#email-field-rg").val()){
				takenUser = true;
			}
		}
		
		if (isEmpty){
			showStates();
			$("#rg-empty-err").show();
		}else if (takenUser){
			showStates();
			$("#rg-usertaken-err").show();
		}else if(!samePass){
			showStates();
			$("#rg-pass-err").show();
		}
		if (!isEmpty && samePass && !takenUser){
			var newUser = {};
			newUser.email = $("#email-field-rg").val();
			newUser.password = $("#password-field-rg").val();
			
			var lat, lon;
			if (navigator.geolocation){
				navigator.geolocation.getCurrentPosition(function(pos){
					//success
					lat = pos.coords.latitude;
					lon = pos.coords.longitude;
					newUser.latitude = lat;
					newUser.longitude = lon;
					sendNewUser(newUser);
				}, function(){
					//error, or failed
					lat = "Position Unavailable";
					lon = "Position Unavailable";
					newUser.latitude = lat;
					newUser.longitude = lon;
					sendNewUser(newUser);
				},
				{maximumAge:60000, timeout:5000, enableHighAccuracy:true});
			}else{
				lat = "Position Unavailable";
				lon = "Position Unavailable";
				newUser.latitude = lat;
				newUser.longitude = lon;
				sendNewUser(newUser);
			}
		}
		
	});
	
	function sendNewUser(newUser){
		$.ajax({
			url: "/newUser",
			type: 'POST',
			data: JSON.stringify(newUser),
			contentType: 'application/json',
			success: function(data){
				current_user = jQuery.extend(true, {}, data); //Copy the returned object	
				state = 3;
				header_state = 1;
				showStates();
			}
		});
	}
	
	$("#login-butt-lgn").click(function(){
		var isEmpty = false;
		var container_children = $(this).parent().children();
		container_children.each(function(){
			if ($(this).val() == "" && $(this).is("input")){
				isEmpty = true;
			}
		});
		if (!isEmpty){
			var email_entry = $("#email-field-lgn").val();
			var pass_entry = $("#password-field-lgn").val();
			var obj = {};
			obj.email = email_entry;
			obj.password = pass_entry;
			
			if (navigator.geolocation){
				navigator.geolocation.getCurrentPosition(function(pos){
					//success
					lat = pos.coords.latitude;
					lon = pos.coords.longitude;
					obj.location = {latitude: lat, longitude: lon};
					sendGetUser(obj);
				}, function(){
					//error, or failed
					lat = "Position Unavailable";
					lon = "Position Unavailable";
					obj.location = {latitude: lat, longitude: lon};
					sendGetUser(obj);
				},
				{maximumAge:60000, timeout:5000, enableHighAccuracy:true});
			}else{
				lat = "Position Unavailable";
				lon = "Position Unavailable";
				obj.location = {latitude: lat, longitude: lon};
				sendGetUser(obj);
			}
			
		}else{
			showStates();
			$("#lgn-empty-err").show();
		}
		
	});
	
	function sendGetUser(obj){
		$.ajax({
			url: "/getUser",
			type: 'POST',
			data: JSON.stringify(obj),
			contentType: 'application/json',
			success: function(data){
				if (typeof(data) == typeof("")){
					showStates();
					$("#lgn-pass-err").show();
				}else{
					current_user = data;
					state = 3;
					header_state = 1;
					showStates();
				}
			}
		});
	}
	
	$(".h-back").click(function(){
		if (state < logged_state){
			state = 0;
			header_state = 0;
		}else{
			state = logged_state;
			header_state = 1;
		}
		showStates();
	});
	
	$("#logout").click(function(){
		state = 0;
		header_state = 0;
		current_user = null;
		viewing_user = null;
		showStates();
	});
	
	$("#admin-delete-user").click(function(){
		if (viewing_user != null){
			$.ajax({
				url: "/delUser",
				type: 'POST',
				data: JSON.stringify(viewing_user),
				contentType: 'application/json',
				success: function(data){
					state = 3;
					header_state = 1;
					viewing_user = null;
					showStates();
				}
			});
		}
	});
	
	$("#super-admin-make-admin").click(function(){
		var aobj = {};
		aobj.adminStatus = 1;
		$.ajax({
			url: "/updateUser/:"+viewing_user._id,
			type: 'PUT',
			data: JSON.stringify(aobj),
			contentType: 'application/json',
			success: function(data){
				state = 3;
				header_state = 1;
				showStates();
			}
		});
	});

	$("#super-admin-del-admin").click(function(){
		var aobj = {};
		aobj.adminStatus = 0;
		$.ajax({
			url: "/updateUser/:"+viewing_user._id,
			type: 'PUT',
			data: JSON.stringify(aobj),
			contentType: 'application/json',
			success: function(data){
				state = 3;
				header_state = 1;
				showStates();
			}
		});
	});
	
	$("#header-display-name").click(function(){
		state = 4;
		header_state = 1;
		viewing_user = current_user;
		showStates();
	});
	
	$("#header-display-img").click(function(){
		state = 4;
		header_state = 1;
		viewing_user = current_user;
		showStates();
	});
	
	$("#edit-button").click(function(){
		state = 4;
		header_state = 1;
		showStates();
	});
	
	$("#update-ed").click(function(){
		var dnVal = $("#display-name-ed").val();
		var dsVal = $("#description-ed").val();
		
		if (dsVal != "" && dsVal.length > 500){
			showStates();
			$("#ed-descr-err").show();
		}else if (dnVal != "" || dsVal != ""){
			if (dnVal == ""){
				dnVal = $("#display-name-ed").attr("placeholder");
			}else if (dsVal == ""){
				dsVal = $("#description-ed").attr("placeholder");
			}
			var obj = {};
			obj.displayName = dnVal;
			obj.description = dsVal;
			console.log("Updating: "+viewing_user.email);
			$.ajax({
				url: "/updateUser/:"+viewing_user._id,
				type: 'PUT',
				data: JSON.stringify(obj),
				contentType: 'application/json',
				success: function(data){
					//updates current_user
					updateUser(viewing_user, function(){
						state = 3;
						header_state = 1;
						showStates();
					});
				}
			});
		}else{
			showStates();
			$("#ed-empty-err").show();
		}
	});
	
	$("#description-ed").on('input', function(){
		var count = $(this).val().length;
		$("#char-count").html("Character Count: "+count);
	});
	
	$("#change-pass-ed").click(function(){
		var oldpass_val = $("#old-password-ed").val();
		var newpass_val = $("#new-password-ed").val();
		var confnewpass_val = $("#confirm-new-password-ed").val();
		
		var isEmpty = false;
		var container_children = $(this).parent().children();
		container_children.each(function(){
			if ($(this).val() == "" && $(this).is("input")){
				isEmpty = true;
			}
		});
		if (isEmpty){
			showStates();
			$("#ed-pass-empty-err").show();
		}else if (newpass_val != confnewpass_val){
			showStates();
			$("#ed-new-pass-err").show();
		}else if (oldpass_val != viewing_user.password){
			showStates();
			$("#ed-old-pass-err").show();
		}else{
			var obj = {}
			obj.password = newpass_val;
			$.ajax({
				url: "/updateUser/:"+viewing_user._id,
				type: 'PUT',
				data: JSON.stringify(obj),
				contentType: 'application/json',
				success: function(data){
					updateUser(viewing_user, function(){
						state = 3;
						header_state = 1;
						showStates();
					});
				}
			});
		}
	});
	
	$("#update-pp-ed").click(function(){
		var isEmpty = $("#profile-pic-ed").val() == "";
		if (isEmpty){
			showStates();
			$("#ed-pp-empty-err").show();
		}else{
			var obj = {};
			obj.profileLink = $("#profile-pic-ed").val();
			$.ajax({
				url: "/updateUser/:"+viewing_user._id,
				type: 'PUT',
				data: JSON.stringify(obj),
				contentType: 'application/json',
				success: function(data){
					updateUser(viewing_user, function(){
						state = 3;
						header_state = 1;
						showStates();
					});
				}
			});
		}
	});
	
	
	$('body').click(function(e){
		var pattern = "user_";
		var target = $(e.target);
		var tid = target.attr('id');
		if (typeof(tid) !== "undefined"){
			if (startsWith(tid, pattern)){
				var index = parseInt(tid.substring(pattern.length));
				state = 5;
				header_state = 1;
				viewing_user = clientSideUsersList[index];
				showStates();
			}
			
		}
		
	});
	
	function updateUser(user, f){
		if (user != null){
			$.ajax({
			url: "/getUserById/:"+user._id,
			type: 'GET',
			success: function(user_data){
					if (user._id == current_user._id){
						current_user = user_data;
						user = user_data;
					} 
					f();
				}
			});
		}
	}
	
	
	function showStates(){
		$(".toggle").hide();
		showHeadState();
		showState();

		if (state > 2 && current_user == null){
			state = 0;
			header_state = 0;
			console.log("hit the safety");
		}
		
		stateBehaviours();
		saveSession();
	}
	
	function showHeadState(){
		header_container.children().each(function(){
			$(this).hide();
		});
		header_container.children().eq(header_state).show();
		header_container.children().eq(2).show();
	}
	
	function showState(){
		container.children().each(function(){
			$(this).hide();
		});
		container.children().eq(state).show();
	}
	
	function setUsersList(){
		$.ajax({
			url: "/getAllUsers",
			type: 'GET',
			contentType: 'application/json',
			success: function(data){
				var usersList = data;
				clientSideUsersList = data;
				var compString = "";
				for (i=0;i<usersList.length;i++){
					var tempstr = "<tr>";
					var idstr = "<td" + " id=user_" + i + ">"; 
					tempstr += "<td>" + usersList[i].email + "</td>";
					tempstr += idstr + usersList[i].displayName + "</td>";
					tempstr += "</tr>";
					compString += tempstr;
				}
				$("#table-body").html(compString);
			}
		});
	}
	
	function handleProfile(){
		var isCurrentUser = viewing_user._id == current_user._id;
		$("#profile-title").html(viewing_user.displayName + "'s Profile");
		$("#user-email").html(viewing_user.email);
		$("#user-display-name").html(viewing_user.displayName);
		$("#user-descr").html(viewing_user.description);
		$("#user-pp").attr("src", viewing_user.profileLink);
		$("#user-ip").html(viewing_user.ip);
		$("#user-latitude").html("Latitude: "+viewing_user.location.latitude);
		$("#user-longitude").html("Longitude: "+viewing_user.location.longitude);
		
		//Adjusting page based on permissions
		if (isCurrentUser || (current_user.adminStatus > viewing_user.adminStatus)){
			$("#edit-button").show();
		}
		if (current_user.adminStatus > 0 && viewing_user.adminStatus == 0){
			$("#adminOptions").show();
		}
		if (current_user.adminStatus == 2){
			if (!isCurrentUser){
				$("#adminOptions").show();
				if (viewing_user.adminStatus == 0){
					$("#super-admin-make-admin").show();
				}else{
					$("#super-admin-del-admin").show();
				}
			}
			$("#admin-section").show();
		} 
	}
	
	function stateBehaviours(){
		switch(state){
			case 0:
				current_user = null;
				break;
			case 1:
				current_user = null;
				break;
			case 2:
				current_user = null;
				break;
			case 3:
				var begin_text = "";
				if (current_user.adminStatus > 0){
					begin_text = "Welcome, Administrator ";
				}else{
					begin_text = "Welcome, ";
				}
				$("#accounts-welcome").html(begin_text+current_user.displayName+"!");
				
				viewing_user = null;
				setUsersList();
				break;
			case 4:
				$("#ed-profile-pic").attr("src", viewing_user.profileLink);
				$("#email-field-ed").attr("placeholder", viewing_user.email);
				$("#display-name-ed").attr("placeholder", viewing_user.displayName);
				$("#description-ed").attr("placeholder", viewing_user.description);
				break;
			case 5:
				handleProfile();
				break;
			default:
				console.log("Error: Something went wrong");
		}
		if (header_state == 1){
			var savedImg = current_user.profileLink;
			var savedDisplayName = current_user.displayName;
			$("#header-display-img").attr("src", savedImg);
			$("#header-display-name").html(savedDisplayName);
		}
		$("input").val("");
	}
	
	function saveSession(){
		sessionStorage.setItem('state', state);
		sessionStorage.setItem('header_state', header_state);
		sessionStorage.setItem('current_user', JSON.stringify(current_user));
		sessionStorage.setItem('viewing_user', JSON.stringify(viewing_user));
		sessionStorage.setItem('clientSideUsersList', JSON.stringify(clientSideUsersList));
	}
});

function startsWith(str1, str2){
	return str1.slice(0, str2.length) == str2;
}
