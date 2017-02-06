/*
	auth: huangyaru
	first: 2017-01-08				
	dependent: jqeury 1.12.2+
	the plugin duty: 一个单页的多路由插件，可以实现同时打开多个填写的表单，切换的时候页面数据都存在，比较适合PC端使用，移动端路由比较简单，用mvvm就可以实现
					后期会添加二级路由的功能和配置，并完成相对应的操作
*/

(function(window){
	function OnePage(args){
		var _menuItemList =args.routes;
		var HOST = "";
		// 判断一个值
		var _isInArray = function(value,arr,match){
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
		};
		// 参数中携带的一些参数
		this.options = {
			"header" : args.header || ".content-header",
			"container" : args.container || ".content-main",
			"sideList" : args.sideList || ".onePageList"
		};

		// 路由中的一些方法（给添加自定义事件使用）
		this.methods = {
			"headerAddFncFlag" : args.headerAddFncFlag || false,
			"headerRemoveFncFlag" : args.headerRemoveFncFlag || false,
			"headerApendCallback" : args.headerApendCallback || function(){ return false;},
			"headerDelCallback" : args.headerDelCallback || function(){ return false},
			"afterContainerChangeFnc" : args.afterContainerChangeFnc || function(){}
		};
		this.default = {
			"currentUrl": "",
			"localWholeUrl":"",
			"orginUrl" : "",
			"afterUrl" : "",
			"currentTitle" : "",
			"afterChangeUrlIndex" : -1,
			"deleteUrl" : "",
			"prevPageList" : "",
			"changeFlag" : 0,  //0只是改变当前URL，1是增加url，2是删除url
			"urlArr" : [],
			"historyArr" : []
		};
		this.event = {
			"header-click.op.event": function(){},
			"del-header.op.event": function(){},
			"cur-header-style.op.event": function(){},
			"init.event": function(){}
		};
		this.template = {
			header:'<div data-page="{{pageUrl}}" class="urlBlock"><span class="urlTitle"> {{title}} </span><span class="closePage" style="">x</span></div>'
		}
		this.initial = function(){
			var initUrl = window.location.hash;
			var arr = initUrl.split("!/");
			var curTitle = "";
			$(this.options.container).empty();
			$(this.options.header).empty();
			this.default.urlArr = [];
			if(initUrl){
				for(var i = 1; i < arr.length; i++){
					this.default.currentUrl = arr[i];
					for(var j = 0; j <_menuItemList.length; j++){
						if(arr[i].split('?')[0] === _menuItemList[j].url){
							this.default.currentTitle =_menuItemList[j].title;
							break;
						}
					}
					this.default.urlArr.push(arr[i]);
					this.initCurrentPageStyle();
					this.appendHeader();
				}
				this.default.currentUrl = arr[0].substr(1);
				this.appendContainer();
				this.methods.afterContainerChangeFnc()
				for(var i = 0; i <_menuItemList.length; i++){
					if(_menuItemList[i].url == this.default.currentUrl){
						this.default.currentTitle =_menuItemList[i].title;
					}
				}
				this.initHeaderStyleFn();
				this.showCurHtml();
			}	
		}
		
		// 给页面sidebar添加事件
		this.initPageListEvent = function(){
			var that = this;
			var $sideList = $(this.options.sideList);
			var value = "";
			$sideList.each(function(){
				$(this).on("click",function(){
					$sideList.removeClass('active');
					$(this).addClass('active');
					that.default.currentUrl = $(this).data("url").split("?")[0];
					if(that.default.currentUrl && that.default.currentUrl !== ""){
						for(var i = 0; i <_menuItemList.length; i++){
							if(_menuItemList[i].url === that.default.currentUrl){
								that.default.currentTitle =_menuItemList[i].title;
							}
						}
						if(_isInArray(that.default.currentUrl, that.default.urlArr, true)){
							that.default.changeFlag = 0;
							that.initCurrentPageStyle();
							that.wholeLocalUrl();
						}
						else{
							that.pushUrl(that.default.currentUrl);
							that.initCurrentPageStyle();
							that.addUrl();
						}
					}
				});
			})
		};
		
		// sidebar初始化事件结束

		// 回退事件（待用，目前考虑还不成熟）
		this.historyUrlInitial = function(){
			var curInUrlLocation = this.initCurrentPageStyle();
			var initUrl = window.location.hash;
			var arr = initUrl.split("!/");
			this.historyArr = this.default.afterUrl.split("!/");
			for(var i = 0; i < this.historyArr.length; i++){
				if(this.historyArr.length > this.default.urlArr.length){ //地址栏增加
					this.addUrl();
					this.appendHeader();
					this.appendContainer();
					this.methods.afterContainerChangeFnc()
				}
				else if(this.historyArr.length < this.default.urlArr.length){ //地址栏减少
					this.deleteUrl();
					this.delHeader();
					this.delContainer();
				}
				else if(this.historyArr.length == this.default.urlArr.length){
					
				}
				this.default.currentUrl = arr[0].substr(1);
				this.initHeaderClickFn();
				this.showCurHtml();
			}
		};
		
		// 回退事件结束

		// 重组地址栏信息
		this.wholeLocalUrl = function() {
			if(this.default.urlArr.length == 0){
				window.location.href = this.default.orginUrl;
			}
			else{
				window.location.href = this.default.orginUrl + "#" + this.default.currentUrl + this.default.afterUrl;
			}
		};
		
		//地址栏重组结束


		// 头部点击事件
		this.initHeaderStyleFn = function(){
			var that = this;
			$(this.options.header).find(".urlBlock").each(function(){
				if($(this).data("page").split('?')[0] === that.default.currentUrl){
					$(this).addClass("active");
				}
				else{
					if($(this).hasClass('active')){
						$(this).removeClass('active');
					}
				}
			})
		}
		//头部点击事件结束

		// 解析当前地址栏，为后面重组做准备
		this.initCurrentPageStyle = function(){
			this.default.localWholeUrl = window.location.toString(); //当前地址栏的整个字符串
			this.default.orginUrl = HOST + location.pathname;
			this.default.afterUrl = (function(){					//当前页面中所有选项卡
				var temp = "";
				var str = window.location.hash.substr(1).split("!/");
				for(var i = 1; i < str.length; i++){
					temp += "!/" + str[i];
				}
				return temp;
			})();
		};
		
		 //地址栏解析结束

		this.pushUrl = function(){
			var that = this;
			this.default.urlArr.push(that.default.currentUrl);
		};

		this.delUrlInArray = function(){
			var that = this;
			var arr = that.default.urlArr;
			var index = 0;
			for(var i = 0; i < arr.length; i++){
				if(arr[i].match(that.default.deleteUrl)){
					that.default.afterChangeUrlIndex = i;
					that.default.urlArr.splice(i,1);
				}
			}
		};

		this.appendHeader = function(){
			var that = this;
			var flag = 1;
			$(that.options.header).append(that.template.header.replace(/{{pageUrl}}/g,that.default.currentUrl).replace(/{{title}}/g,that.default.currentTitle));
			// 头部添加之后的回调函数
			that.methods.headerApendCallback();
			$(that.options.header).find(".urlBlock").last().find(".closePage").click(function(){
				that.default.deleteUrl = $(this).parent(".urlBlock").data("page").split("?")[0];
				that.delUrl();		
			});
			$(that.options.header).find(".urlBlock:last").find(".urlTitle").click(function(){
				that.default.currentUrl = $(this).parent(".urlBlock").data("page").split('?')[0];
				$(that.options.container).find(".containerPage").each(function(){
					if($(this).data("page").split('?')[0] === that.default.currentUrl){
						flag = 0;
					}
				})
				that.default.changeFlag = flag;
				that.initCurrentPageStyle();
				that.wholeLocalUrl();
			})
		};


		// 头部滑动效果
		this.headerApendCallback = function(){
			var that = this;
			var headerWidth =  $(that.options.header).width();
			var $currentHeader = $("#content>.container>.container-header>.container-block");
			var currentWidth =  $currentHeader.width();
			var currentPositon = $currentHeader.position().left;
			if($(".header-wheel").hasClass("hide-default") && currentWidth >= headerWidth){
				$(".header-wheel").removeClass("hide-default");
			}
			if(currentWidth > headerWidth && currentPositon > (-(currentWidth - headerWidth)-121) ){
				$currentHeader.animate({"left":currentPositon-121});
			}
		}

		// 删除头部选项卡
		this.delHeader = function(){
			var that = this;
			$(this.options.header).find(".urlBlock").each(function(){
				if($(this).data("page").split('?')[0] === that.default.deleteUrl){
					$(this).remove();
				}
			});
			var headerWidth =  $("#content>.container").width();
			var $currentHeader = $("#content>.container>.container-header>.container-block");
			var currentWidth =  $currentHeader.width();
			if(currentWidth < headerWidth){
				$(".header-wheel").addClass('hide-default');
			}
			if(that.methods.headerRemoveFncFlag){
				that.methods.headerDelCallback();
			}
		};

		// 删除头部选项卡之后的滑动效果
		this.headerDelCallback = function(){
			var headerWidth =  $("#content>.container").width();
			var $currentHeader = $("#content>.container>.container-header>.container-block");
			var currentPositon = $currentHeader.position().left;
			var currentWidth =  $currentHeader.width();
			if(!$(".header-wheel").hasClass("hide-default") && currentWidth < headerWidth){
				$(".header-wheel").addClass("hide-default");
			}
			if(currentPositon < 0){
				$currentHeader.animate({"left":currentPositon+121 > 0 ? 0 :currentPositon+121});
			}
		}

		// 路由每个选项卡的内容
		this.appendContainer = function(){
			var that = this;
			var str = that.default.currentUrl.split("?")[0];
			$(this.options.container).append("<div data-page=" + str + " class='containerPage'></div>");
			$(this.options.container).find(".containerPage:last").load(str, function(){
				// 这里后续添加一些方法
			});
		}



		// 从携带的参数跳转页面的方式
		function otherWayToOtherPage(that){
					// 手动执行打开新页面的方法的时候执行的事件
			function _openNewPage(obj){
				var targetUrl = obj.targetUrl;
				var data = obj.data;
				var urlStr = "";
				that.default.changeFlag = 1;
				that.initCurrentPageStyle();
				if(that.callback && (typeof that.callback === "function")){
					that.methods.afterContainerChangeFnc = that.callback;
				}
				if(targetUrl == that.default.currentUrl){
					that.methods.afterContainerChangeFnc();
				}
				// 分为两种情况1.当前选项卡已经打开 2.重新打开
				var currentUrl = targetUrl;
				var afterUrl = window.location.href.toString().split("!/");
				this.getCurrentTitle(currentUrl);

				// 这个for循环是为了判断当前应用中是否已经存在要跳转的页面
				for(var i = 1; i < afterUrl.length; i++){
					if(afterUrl[i].split('?')[0] === currentUrl){
						that.default.changeFlag = 0;
						if(data === undefined){
							that.default.currentUrl = targetUrl;
							that.wholeLocalUrl();
							return;
						}
						else{
							that.closeCurrentPage({
								delUrl:currentUrl
							})
							that.default.changeFlag = 1;
							afterUrl[i] = currentUrl + "?"+data;
						}
					}
					urlStr += "!/" + afterUrl[i];
				}
				that.default.currentUrl = targetUrl;
				if(that.default.changeFlag === 0){	
					window.location.href = that.default.orginUrl + "#" + that.default.currentUrl + urlStr;
				}
				if(that.default.changeFlag === 1){
					if(data === undefined){
						that.pushUrl(that.currentUrl);
						that.initCurrentUrl();
						that.addUrl();
					}
					else{
						that.pushUrl(that.currentUrl + "?" + data);
						window.location.href = that.default.orginUrl + "#" + that.default.currentUrl + that.default.afterUrl + "!/" + currentUrl + "?" + data;
					}
				};	
			}
			that.openNewPage = _openNewPage;

			function _toOtherPage(obj){
				function sleep(time){
				    var cur = Date.now();
				    while(cur + time >= Date.now()){}
				}

				delUrl = obj.delUrl; //当前要关闭的选项卡
	            var toUrl = obj.toUrl; //要跳转的选项卡
				swal({
	                title: '<h5 style="font-size:20px;">提示</h5>',
	                text: " 提交成功" ,
	                showConfirmButton : false,
	                timer:1000,
	                html:true
	            });
	            
				sleep(1000);
	            var index = 0;
	            $(".container-header").find(".urlBlock").each(function(){
	                var thisPage = $(this).data("page").split('?')[0];
	                if(thisPage === delUrl){
	                    $(this).find(".closePage").click();
	                }
	                else if(thisPage.match(toUrl)){
	                    $(this).find(".urlTitle").click();
	                    index ++;
	                }
	            })
	            if(index === 0){
	                $(toUrl.split(".")[0]).click();
	            }
			}
			that.toOtherPage = _toOtherPage;


			function _closeCurrentPage(obj){
				var delUrl = obj.delUrl; //当前要关闭的选项卡
	            var toUrl = obj.toUrl; //要跳转的选项卡
				var index = 0;
				if(obj.callback && typeof obj.callback == "function"){
	            	that.methods.afterContainerChangeFnc = obj.callback;
	            }
	            $(that.options.header).find(".urlBlock").each(function(){
	                var thisPage = $(this).data("page").split('?')[0];
	                if(thisPage && thisPage === delUrl){
	                    $(this).find(".closePage").click();
	                }
	            })
			}
			that.closeCurrentPage = _closeCurrentPage;


			function _readUrlData(obj) {
				var currentUrl = obj.currentUrl;
				var afterUrl = window.location.href.toString().split("!/");
				var dataStr = "";
				var dataArr = [];
				var dataJson = {};
				for(var i = 1; i < afterUrl.length; i++){
					if(afterUrl[i].match(currentUrl)){
						dataStr = afterUrl[i].split("?")[1] || "";
					}
				}
				if(dataStr.indexOf("&")){
					dataArr = dataStr.split("&");
				}
				else{
					dataArr.push(dataStr);
				}
				
				for(var i = 0; i < dataArr.length; i++){
					var key = dataArr[i].split("=")[0];
					dataJson[key] = dataArr[i].split("=")[1];
				}
				return dataJson;
			}
			that.readUrlData = _readUrlData;

		}
		// ---------其他跳转页面方式结束
		otherWayToOtherPage(this);

			

		this.getCurrentTitle = function(currentUrl){
			var that = this;
			for(var i = 0; i < _menuItemList.length; i++){
				if(currentUrl === _menuItemList[i].url){
					that.default.currentTitle = _menuItemList[i].title;
				}
			}
		}


		this.delContainer = function(){
			var that = this;
			$(this.options.container).find(".containerPage").each(function(){
				if($(this).data("page").split('?')[0] == that.default.deleteUrl){
					$(this).remove();
				}
			});
		};

		this.addUrl = function(){
			this.default.changeFlag = 1;
			this.default.orginUrl = HOST + location.pathname;
			this.default.afterUrl = this.default.afterUrl + "!/" + this.default.currentUrl;
			this.wholeLocalUrl();
		};

		this.delUrl = function(){
			this.default.changeFlag = 2;
			var that = this;
			// var str = this.default.afterUrl.split("!/" + that.default.deleteUrl);
			var str = "";
			for(var i = 0; i < that.default.urlArr.length; i++){
				if(!that.default.urlArr[i].match(that.default.deleteUrl)){
					str += "!/" + that.default.urlArr[i];
				}
			} 
			this.delUrlInArray();
			if(that.default.deleteUrl.indexOf(that.default.currentUrl) !== -1){
				if(this.default.afterChangeUrlIndex == this.default.urlArr.length && this.default.urlArr.length !== 0){
					this.default.afterChangeUrlIndex -= 1;
				}
				if(this.default.urlArr.length !== 0){
					this.default.currentUrl = this.default.urlArr[this.default.afterChangeUrlIndex].split("?")[0];
				}
				
			}
			this.default.afterUrl = str;
			that.wholeLocalUrl();
		};

		this.showCurHtml = function(){
			var that = this;
			$(this.options.container).find(".containerPage").each(function(){
				if($(this).data("page").split('?')[0] === that.default.currentUrl){
					$(this).show();
				}
				else{
					$(this).hide();
				}
			})
		};

		// 往路由配置数组中Push新的路由地址
		this.routerPush = function(router){
			// router对象必须包含url（路由地址）和title（路由头部显示的东西）两个属性
			var routerArr = _menuItemList;
			for(var i = 0; i < routerArr.length; i++){
				if(routerArr[i].url === router.url && routerArr[i].title === router.title){
					return;
				}
				else if(routerArr[i].url === router.url || routerArr[i].title === router.title){
					alert("要添加的路由的url或title和配置的某个路由重合了！")
					return;
				}
			}

			_menuItemList.push(router);
			
		}


		// 组合方法
		this.addHashUrl = function(){
			var that = this;
			var flag = 0;
			$(that.options.header).find(".urlBlock").each(function(){
				if($(this).data("page").split('?')[0] === that.default.currentUrl){
					flag = 1;
				}
			})
			if(flag === 0){
				that.appendHeader();
			}
			this.initHeaderStyleFn();			
			this.appendContainer();
			this.showCurHtml();
			this.default.afterChangeUrlIndex = -1;
		}

		this.delHashUrl = function(){
			this.delHeader();
			this.delContainer();
			this.initHeaderStyleFn();
			this.showCurHtml();
		}

		this.onlyChangCurrentUrl = function(){
			this.initHeaderStyleFn();
			this.showCurHtml();
		}

		// 该方法主要用于初始化，删除选项卡操作之后，当前页面是否加载
		this.checkCurrentPageIsExit = function(){
			var that = this;
			var flag = 0;
			$(that.options.container).find(".containerPage").each(function(){
				if($(this).data("page").split('?')[0] === that.default.currentUrl){
					flag = 1;
				}
			});
			if(flag === 0){
				this.appendContainer();
			}
		}


		// 监听地址栏
		this.addUrlChangeListener = function(){
			var that = this;
			window.onhashchange = function(){
				switch(that.default.changeFlag){
					case 0: 
						that.onlyChangCurrentUrl();
						break;
					case 1:
						that.addHashUrl();
						that.default.afterChangeUrlIndex = -1;
						break;
					case 2:
						that.delHashUrl();
						that.checkCurrentPageIsExit();
						break;
					default:
						that.initial();
						break;
				}
				that.default.changeFlag = "";
				that.methods.afterContainerChangeFnc();
				that.methods.afterContainerChangeFnc = function(){};
			}
		}
		this.initial();
		this.addUrlChangeListener();
		this.initPageListEvent();
	}

	// export this plugin
	window.OPRouter = OnePage;

})(window)
