/*
anthor: huangyaru
time: 2017/01/03
content: one-page-router

*/
var HOST = "";
var menuItemList = [
	{"url":"home.html","title":"首页"}, 
	{"url":"log.html","title":"活动页"},
	{"url":"about.html","title":"详情页"}
];
function isInArray(value,arr,match){
	for(var i = 0; i < arr.length; i++){
		if(match === false){
			if(arr[i].match(value)){
				return true;
			}
		}
		else{
			if(value == arr[i]){
				return true;
			}
		}
	}
	return false;
}


var titleUrl = [];
function OnePage(obj){
	var obj = obj || {};
	this.changeFlag = 0; //0只是改变当前URL，1是增加url，2是删除url
	this.header = obj.header || ".content-header";
	this.container = obj.container || ".content-main";
	this.sideList = obj.sideList || ".onePageList";
	this.currentUrl = obj.currentUrl;
	this.urlArr = [];
	// this.titleArr = [];
	this.historyArr = [];
	this.headerAddFncFlag = obj.headerAddFncFlag || false,
	this.headerRemoveFncFlag = obj.headerRemoveFncFlag || false,
	this.headerApendCallback = obj.headerApendCallback || function(){ return false;},
	this.headerDelCallback = obj.headerDelCallback || function(){ return false},
	this.param = {
		localWholeUrl:"",
		orginUrl : "",
		afterUrl : "",
		currentTitle : ""
	};
	this.afterChangeUrlIndex = -1;
	this.deleteUrl = "";
	this.prevPageList = "";
	this.afterContainerChangeFnc = obj.afterContainerChangeFnc || function(){};
	this.headerTemplate = '<div data-page="{{pageUrl}}" class="urlBlock"><span class="urlTitle"> {{title}} </span><span class="closePage" style="">x</span></div>'
	// 初始化时给左边的菜单添加事件
	this.initPageListEvent = function(){
		var obj = this;
		var $sideList = $(this.sideList);
		var value = "";
		$sideList.each(function(){
			$(this).on("click",function(){
					$sideList.removeClass('active');
				$(this).addClass('active');
				obj.currentUrl = $(this).data("url").split("?")[0];
				if(obj.currentUrl && obj.currentUrl != ""){
					for(var i = 0; i < menuItemList.length; i++){
						if(menuItemList[i].url === obj.currentUrl){
							obj.param.currentTitle = menuItemList[i].title;
						}
					}
					if(isInArray(obj.currentUrl, obj.urlArr, true)){
						obj.changeFlag = 0;
						obj.initCurrentUrl();
						obj.wholeLocalUrl();
					}
					else{
						obj.pushUrl(obj.currentUrl);
						obj.initCurrentUrl();
						obj.addUrl();
					}
				}
			});
		})
	};
	this.historyUrlInitial = function(){
		var curInUrlLocation = this.initCurrentUrl();
		var initUrl = window.location.hash;
		var arr = initUrl.split("!/");
		this.historyArr = this.param.afterUrl.split("!/");
		for(var i = 0; i < this.historyArr.length; i++){
			if(this.historyArr.length > this.urlArr.length){ //地址栏增加
				this.addUrl();
				onePage.appendHeader();
				onePage.appendContainer();
				onePage.afterContainerChangeFnc()
			}
			else if(this.historyArr.length < this.urlArr.length){ //地址栏减少
				this.deleteUrl();
				onePage.delHeader();
				onePage.delContainer();
			}
			else if(this.historyArr.length == this.urlArr.length){
				
			}
			this.currentUrl = arr[0].substr(1);
			onePage.initHeadStyle();
			onePage.showCurHtml();
		}


	}
	this.initial = function(){
		var initUrl = window.location.hash;
		var arr = initUrl.split("!/");
		var curTitle = "";
		$(this.container).empty();
		$(this.header).empty();
		this.urlArr = [];
		if(initUrl){
			for(var i = 1; i < arr.length; i++){
				this.currentUrl = arr[i];
				for(var j = 0; j < menuItemList.length; j++){
					if(arr[i].match(menuItemList[j].url)){
					// if(menuItemList[j].url == arr[i]){
						this.param.currentTitle = menuItemList[j].title;
						break;
					}
				}
				this.urlArr.push(arr[i]);
				this.initCurrentUrl();
				this.appendHeader();
				this.appendContainer();
				this.afterContainerChangeFnc()
			}
			this.currentUrl = arr[0].substr(1);
			for(var i = 0; i < menuItemList.length; i++){
				if(menuItemList[i].url == this.currentUrl){
					this.param.currentTitle = menuItemList[i].title;
				}
			}
			this.initHeadStyle();
			this.showCurHtml();
		}	
	}
	this.wholeLocalUrl = function(){
		if(this.urlArr.length == 0){
			window.location.href = this.param.orginUrl;
		}
		else{
			window.location.href = this.param.orginUrl + "#" + this.currentUrl + this.param.afterUrl;
		}
	};
	this.initHeadStyle = function(){
		var obj = this;
		$(this.header).find(".urlBlock").each(function(){
			if($(this).data("page").match(obj.currentUrl)){
				$(this).addClass("active");

			}
			else{
				if($(this).hasClass('active')){
					$(this).removeClass('active');
				}
			}
		})
	}
	this.initCurrentUrl = function(){
		this.param.localWholeUrl = window.location.toString(); //当前地址栏的整个字符串
		this.param.orginUrl = HOST + location.pathname;
		this.param.afterUrl = (function(){					//当前页面中所有选项卡
			var temp = "";
			var str = window.location.hash.substr(1).split("!/");
			for(var i = 1; i < str.length; i++){
				temp += "!/" + str[i];
			}
			return temp;
		})();
	};
	this.pushUrl = function(currentUrl){
		var obj = this;
		this.urlArr.push(currentUrl);
	};
	this.delUrlInArray = function(){
		var obj = this;
		var arr = obj.urlArr;
		var index = 0;
		for(var i = 0; i < arr.length; i++){
			if(arr[i].match(obj.deleteUrl)){
				obj.afterChangeUrlIndex = i;
				obj.urlArr.splice(i,1);
			}
		}
	}
	this.appendHeader = function(){
		var that = this;
		$(this.header).append(that.headerTemplate.replace(/{{pageUrl}}/g,that.currentUrl).replace(/{{title}}/g,that.param.currentTitle));
		if(that.headerAddFncFlag){
			that.headerApendCallback();
		}
		$(this.header).find(".urlBlock").last().find(".closePage").click(function(){
			that.deleteUrl = $(this).parent(".urlBlock").data("page").split("?")[0];
			that.delUrl();
			
		});
		$(this.header).find(".urlBlock:last").find(".urlTitle").click(function(){
			that.changeFlag = 0;
			that.currentUrl = $(this).parent(".urlBlock").data("page").split("?")[0];
			that.initCurrentUrl();
			that.wholeLocalUrl();
		})
	};
	this.delHeader = function(){
		var obj = this;
		$(this.header).find(".urlBlock").each(function(){
			if($(this).data("page").match(obj.deleteUrl)){
				$(this).remove();
			}
		})
		var headerWidth =  $("#content>.container").width();
		var $currentHeader = $("#content>.container>.container-header>.container-block");
		var currentWidth =  $currentHeader.width();
		if(currentWidth < headerWidth){
			$(".header-wheel").addClass('hide-default');
		}
		if(obj.headerRemoveFncFlag){
			obj.headerDelCallback();
		}
	};
	this.appendContainer = function(){
		var obj = this;
		var str = obj.currentUrl.split("?")[0];
		$(this.container).append("<div data-page=" + str + " id='" + str + ".html' class='containerPage'></div>");
		$(this.container).find(".containerPage:last").load(str, function(){
			if($(this).html().indexOf("invalidSession")>-1){
				window.location.href="/login.html";
			}
		});
	}
	this.delContainer = function(){
		var obj = this;
		$(this.container).find(".containerPage").each(function(){
			if($(this).data("page") == obj.deleteUrl){
				$(this).remove();
			}
		});
	};
	this.addUrl = function(){
		this.changeFlag = 1;
		this.param.orginUrl = HOST + location.pathname;
		this.param.afterUrl = this.param.afterUrl + "!/" + this.currentUrl;
		this.wholeLocalUrl();
	};
	this.changeUrl = function(){

	};
	this.delUrl = function(){
		this.changeFlag = 2;
		var obj = this;
		// var str = this.param.afterUrl.split("!/" + obj.deleteUrl);
		var str = "";
		for(var i = 0; i < obj.urlArr.length; i++){
			if(!obj.urlArr[i].match(obj.deleteUrl)){
				str += "!/" + obj.urlArr[i];
			}
		} 
		this.delUrlInArray();
		if(obj.deleteUrl.indexOf(obj.currentUrl) != -1){
			if(this.afterChangeUrlIndex == this.urlArr.length && this.urlArr.length !== 0){
				this.afterChangeUrlIndex -= 1;
			}
			if(this.urlArr.length !== 0){
				this.currentUrl = this.urlArr[this.afterChangeUrlIndex].split("?")[0];
			}
			
		}
		this.param.afterUrl = str;
		obj.wholeLocalUrl();
	};
	this.showCurHtml = function(){
		var obj = this;
		$(this.container).find(".containerPage").each(function(){
			if($(this).data("page") === obj.currentUrl){
				$(this).show();
			}
			else{
				$(this).hide();
			}
		})
	};
}

var onePage = new OnePage({
	// headerAddFncFlag : true,
	// headerRemoveFncFlag : true,
	// headerApendCallback : function(){
	// 	var headerWidth =  $("#content>.container").width();
	// 	var $currentHeader = $("#content>.container>.container-header>.container-block");
	// 	var currentWidth =  $currentHeader.width();
	// 	var currentPositon = $currentHeader.position().left;
	// 	if($(".header-wheel").hasClass("hide-default") && currentWidth >= headerWidth){
	// 		$(".header-wheel").removeClass("hide-default");
	// 	}
	// 	if(currentWidth > headerWidth && currentPositon > (-(currentWidth - headerWidth)-121) ){
	// 		$currentHeader.animate({"left":currentPositon-121});
	// 	}
	// },
	// headerDelCallback : function(){
	// 	var headerWidth =  $("#content>.container").width();
	// 	var $currentHeader = $("#content>.container>.container-header>.container-block");
	// 	var currentPositon = $currentHeader.position().left;
	// 	var currentWidth =  $currentHeader.width();
	// 	if(!$(".header-wheel").hasClass("hide-default") && currentWidth < headerWidth){
	// 		$(".header-wheel").addClass("hide-default");
	// 	}
	// 	if(currentPositon < 0){
	// 		$currentHeader.animate({"left":currentPositon+121 > 0 ? 0 :currentPositon+121});
	// 	}
	// },
	// initCurListStyle : function(){
		
	// }

});
onePage.initial();
onePage.initPageListEvent();
window.onhashchange = function(){
	if(onePage.changeFlag === 0){
		onePage.initHeadStyle();
		onePage.showCurHtml();
	}
	else if(onePage.changeFlag === 1){
		onePage.appendHeader();
		onePage.initHeadStyle();
		onePage.appendContainer();
		onePage.showCurHtml();
		this.afterChangeUrlIndex = -1;
	}
	else if(onePage.changeFlag === 2){
		onePage.delHeader();
		onePage.delContainer();
		onePage.initHeadStyle();
		onePage.showCurHtml();
	}
	else{
		console.log(onePage.changeFlag);
		onePage.initial();
	}
	onePage.changeFlag = "";
	onePage.afterContainerChangeFnc();
	onePage.afterContainerChangeFnc = function(){};
};

// 页面路由
