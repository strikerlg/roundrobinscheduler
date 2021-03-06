_3o3.Schedule = new Class({
	Implements: [Events,Chain,Options],
	Binds:['setSchedule'],
	options:{
		bulletImage:'images/bullet.png',
		winnerIcon:'images/basketball_gray_x50.png',
	},
	events:{
		show:'show',
		hide:'hide',
		startCourtRoundClicked:'startCourtRoundClicked'
	},
	initialize: function(element, controller, options){
		this.setOptions(options);
		this.element = element;
		this.controller = controller;
		
		
	},
	setSchedule:function(data){
		if(!this.element.isVisible())return;
	
		this.element.empty();
		var i=0;
		//Add games
		var currentCourtRoundElement;
		Object.each(data.Schedule,
			function(game,roundNumber){
				var roundNum=parseInt(roundNumber);
				this.element.grab(
					this.buildCourtRoundElement(
						game,roundNum,
						data.StartableCourtRoundNums!=null && data.StartableCourtRoundNums.contains(roundNum),
						i,data.CurrentCourtRoundNum));
				i++;
			}.bind(this));
			
			if(
				this.element.scrollTop<1&&
				this.element.scrollHeight>this.element.clientHeight&&
				currentCourtRoundElement!=null)
			{
				var courtRoundHeight=currentCourtRoundElement.offsetHeight;
				var scrollTop=currentCourtRoundElement.offsetTop;
				
				if(this.element.clientHeight>=courtRoundHeight*5)scrollTop-=courtRoundHeight*2;
				this.element.scrollTop=Math.max(0,scrollTop);
			}
	},
	buildCourtRoundElement:function(game,roundNumber,isManuallyStartable,i,currentRound){
		var courtRoundElement=new Element('div',{'class':'_3o3_schedule_display__court_round'});
		courtRoundElement.addClass(i%2==0?'_3o3_schedule_display__court_round__odd':'_3o3_schedule_display__court_round__even');
		
		var courtRoundBullet = new Element('img',{'src':this.options.bulletImage,'class':'_3o3_schedule_display__court_round__bullet'});
		courtRoundElement.grab(courtRoundBullet);
		
		var courtRoundLabel=new Element('span',{'html':roundNumber,'class':'_3o3_schedule_display__court_round__label'});
		courtRoundElement.grab(courtRoundLabel);
	
		var html;
		if(game.NotAssigned)html='Not Assigned';
		else html=game.CourtName;
		var courtRoundText = new Element('div',{'html':html,'class':'_3o3_schedule_display__court_round__text'});
		courtRoundElement.grab(courtRoundText);

		if(game.NotAssigned)courtRoundElement.addClass('_3o3_schedule_display__court_round__not_assigned');
		else if(game.IsCompleted)courtRoundElement.addClass('_3o3_schedule_display__court_round__completed');	
		if(!game.NotAssigned&&game.Team1!=null&&game.Team2!=null){
			var teams=new Element('div',{'class':'_3o3_schedule_display__court_round__teams'});
			
			var showGameResult=(game.IsCompleted&&game.GameResult!=null&&game.GameResult.TeamGameResults!=null);
			if(showGameResult)showGameResult=game.GameResult.TeamGameResults[game.Team1]!=null&&game.GameResult.TeamGameResults[game.Team2]!=null
			if(showGameResult)showGameResult=game.GameResult.TeamGameResults[game.Team1].NumPoints!=null&&game.GameResult.TeamGameResults[game.Team2].NumPoints!=null
			
			
			var team1=new Element('div',{'class':'_3o3_schedule_display__court_round__teams__team1'});
			if(showGameResult&&game.GameResult.TeamGameResults[game.Team1].WonGame)
				team1.grab(new Element('img',{'src':this.options.winnerIcon,'class':'_3o3_schedule_display__court_round__teams__team1__winner_icon'}));
			team1.grab(new Element('span',{'text':game.Team1,'class':'_3o3_schedule_display__court_round__teams__team1__id'}));
			if(game.Team1Name!=null&&game.Team1Name!=game.Team1)
				team1.grab(new Element('span',{'text':game.Team1Name,'class':'_3o3_schedule_display__court_round__teams__team1__name'}));
			if(showGameResult)
				team1.grab(new Element('span',{'text':game.GameResult.TeamGameResults[game.Team1].NumPoints,'class':'_3o3_schedule_display__court_round__teams__team1__num_points'}));
						
			var team2=new Element('div',{'class':'_3o3_schedule_display__court_round__teams__team2'});
			if(showGameResult&&game.GameResult.TeamGameResults[game.Team2].WonGame)
				team2.grab(new Element('img',{'src':this.options.winnerIcon,'class':'_3o3_schedule_display__court_round__teams__team2__winner_icon'}));
			team2.grab(new Element('span',{'text':game.Team2,'class':'_3o3_schedule_display__court_round__teams__team2__id'}));
			if(game.Team2Name!=null&&game.Team2Name!=game.Team2)
				team2.grab(new Element('span',{'text':game.Team2Name,'class':'_3o3_schedule_display__court_round__teams__team2__name'}));
			if(showGameResult)
				team2.grab(new Element('span',{'text':game.GameResult.TeamGameResults[game.Team2].NumPoints,'class':'_3o3_schedule_display__court_round__teams__team2__num_points'}));
			
			teams.adopt(team1,team2);
			courtRoundElement.grab(teams);
		}
		
		if(roundNumber==currentRound){
			courtRoundElement.addClass('_3o3_schedule_display__court_round__current');
			currentCourtRoundElement=courtRoundElement;
		}
		
		if(isManuallyStartable&&game.Id!=null){
			courtRoundElement.addClass('_3o3_schedule_display__court_round__manually_startable');
			courtRoundElement.addEvent('click',this.fireEvent.pass([this.events.startCourtRoundClicked,game.Id],this));
		}
		
		return courtRoundElement;
	},
	show:function(){
		this.element.empty();
		this.element.show();
		this.controller.addEvent(this.controller.events.scoreKeeperScheduleChanged,this.setSchedule);
		this.controller.getSchedule();
		this.fireEvent(this.events.show);
	},
	hide:function(){
		this.element.hide();
		this.controller.removeEvent(this.controller.events.scoreKeeperScheduleChanged,this.setSchedule);
		this.fireEvent(this.events.hide);
	}
});