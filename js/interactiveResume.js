/*
* 关于audio的一些常用属性：
* 【属性】
*   duration：播放的总时间（s）
*   currentTime：当前已经播放的时间（s）
*   ended：是否已经播放完成（true 、false）
*   paused：当前是否为暂停状态（true、false）
*   volume：控制音量（数字0~1）
*
*   【方法】
*   pause()暂停
*   play()播放
*
*   【事件】
*   canplay：可以正常播放（但是播放过程中可能出现卡顿）
*   canplaythrough：资源加载完毕，可以顺畅的播放了
*   ended：已经播放完成
*   loadedmetadata：资源的基础信息已经加载完成
*   loadeddata：整个资源都加载完成
*   pause：触发了暂停
*   play：触发了播放
*   playing：正在播放中
* */

/*loading*/
/*通过图片加载进度，控制进度条的进度*/
let loadingRender = (function () {
    let $loadingBox=$(".loadingBox");
    let $current=$loadingBox.find(".current");
    let imgData=["img/icon.png","img/zf_concatAddress.png","img/zf_concatInfo.png","img/zf_concatPhone.png","img/zf_course.png","img/zf_course1.png","img/zf_course2.png","img/zf_course3.png","img/zf_course4.png","img/zf_course5.png","img/zf_course6.png","img/zf_cube1.png","img/zf_cube2.png","img/zf_cube3.png","img/zf_cube4.png","img/zf_cube5.png","img/zf_cube6.png","img/zf_cubeBg.jpg","img/zf_cubeTip.png","img/zf_emploment.png","img/zf_messageArrow1.png","img/zf_messageArrow2.png","img/zf_messageChat.png","img/zf_messageKeyboard.png","img/zf_messageLogo.png","img/zf_messageStudent.png","img/zf_outline.png","img/zf_phoneBg.jpg","img/zf_phoneDetail.png","img/zf_phoneListen.png","img/zf_phoneLogo.png","img/zf_return.png","img/zf_style1.jpg","img/zf_style2.jpg","img/zf_style3.jpg","img/zf_styleTip1.png","img/zf_styleTip2.png","img/zf_teacher1.png","img/zf_teacher2.png","img/zf_teacher3.jpg","img/zf_teacher4.png","img/zf_teacher5.png","img/zf_teacher6.png","img/zf_teacherTip.png"];

    let n=0;
    let len=imgData.length;

    //=>run:预加载图片的
    let run=function run(callback) {

        imgData.forEach((item)=>{
            let tempImg=new Image();
            tempImg.onload=()=>{
                tempImg=null;
                n++;
                $current.css("width",((n/len)*100)+"%");

                //=>进度条加载完：执行回调函数(让当前loading页面消失)
                if (n===len){
                    //10s前就加载完了，所以把后面的定时器清掉
                    clearInterval(delayTimer);
                    callback && callback();
                }
            };
            tempImg.src=item;
        });
    };
    
    //=>maxDelay：设置最长等待时间（假设10S，到达时间后，我们看加载多少了，如果已经达到了90%以上，我们可以正常访问内容了，如果不足这个比例，直接提示用户当前网络不佳，稍后重试）
    let delayTimer=null;
    let maxDelay=function (callback) {
        delayTimer=setInterval(()=>{
            if (n/len >= 0.7) {
                $current.css("width","100%");//瞬间进度条满点
                callback && callback();
                return;
            }
            alert("当前网络不佳，请稍后重试！");

            window.location.href="https://www.baidu.com/index.php?tn=02049043_66_pg";//此时我们不应该继续加载图片，而是让其关掉页面或者跳转到其他页面
        },20000);
    };

    //=>done:完成
    let done=function () {
        //=>停留一秒钟再移除进入下一环节
        let timer=setTimeout(()=>{
            $loadingBox.remove();
            clearTimeout(timer);

            phoneRender.init();
        },1000);
    };

    return {
        init: function () {
            $loadingBox.css('display','block');
            run(done);
            maxDelay(done);
        }
    }
})();
// loadingRender.init();//由hash路由去控制执行

/*phone*/
let phoneRender = (function () {
    let $phoneBox=$(".phoneBox");
    let $time=$phoneBox.find("span");
    let $answer=$phoneBox.find(".answer");
    let $answerMarkLink=$answer.find(".markLink");
    let $hang=$phoneBox.find(".hang");
    let $hangMarkLink=$hang.find(".markLink");
    let answerBell=$("#answerBell")[0];
    let introduction=$("#introduction")[0];

    //=>点击answerMarkLink
    let answerMarkTouch=function () {
        //=>1.remove answer
        $answer.remove();
        answerBell.pause();
        $(answerBell).remove();//一定要先暂停再移除，否则即使移除了浏览器也会播放这个音频

        //=>2.show hang
        $hang.css("transform","translateY(0)");
        $time.css("display","block");
        introduction.play();
        computedTime();
    };

    //=>计算播放时间：
    let autoTimer=null;
    let computedTime=function computedTime() {
        let duration=0;
        //=>我们让audio播放，首先会去加载资源，部分主要加载完成才会播放，才会计算出总时间duration等信息，所以我们可以把获取信息放到canplay事件中来
        introduction.oncanplay=function(){
            duration=introduction.duration;
        };

        autoTimer=setInterval(()=>{
            let val=introduction.currentTime;//得秒
            // duration=introduction.duration;//总时间放到定时器中获取也可以
            //=>播放完成
            if (val>=duration){
                clearInterval(autoTimer);
                closePhone();
                return;
            }
            let minute=Math.floor(val/60);//向下取整得分钟
            let second=Math.floor(val-minute*60);//减去分钟得剩余的秒
            minute=minute<10?"0"+minute:minute;
            second=second<10?"0"+second:second;

            $time.html(`${minute}:${second}`);
        },1000);
    };

    //=>关闭phone
    let closePhone=function () {
        clearInterval(autoTimer);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();

        messageRender.init();
    };

    return {
        init: function () {
            $phoneBox.css('display','block');

            //=>播放bell
            answerBell.play();
            answerBell.volume=0.05;

            //=>点击answerMarkLink
            $answerMarkLink.on("click",answerMarkTouch);
            $hangMarkLink.on("click",closePhone);
        }
    }
})();

/*message*/
let messageRender = (function () {
    let $messageBox=$('.messageBox');
    let $wrapper=$messageBox.find('.wrapper');
    let $messageList=$wrapper.find('li');
    let $keyBoard=$messageBox.find('.keyBoard');
    let $textInp=$keyBoard.find('span');
    let $submit=$keyBoard.find('.submit');

    let step=-1;//记录当前展示信息的索引
    let total=$messageList.length+1;//记录信息条数（自己发一条，所以加1）
    let autoTimer=null;//记录定时器
    let interval=1500;//记录多久发一条信息（信息相继出现的间隔时间）
    let magicMusic=$('#magicMusic')[0];

    let tt=0;//记录wrapper的初始位置

    //=>自动发送message
    let showMessage=function showMessage() {
        ++step;
        if (step===2){
            //=>已经展示两条了：此时我们暂时结束自动信息发送，让键盘出来，开始执行手动发送
            clearInterval(autoTimer);
            handleSend();
            return;
        }
        let $cur=$messageList.eq(step);//得到的是jq对象，get得到的是原生对象
        $cur.addClass('active');

        //=>自动上移
        if (step >= 3){
            //说明展示的条数已经是四条或四条以上了，此时我们让wrapper向上移动（移动的距离是新展示这一条的高度）
            /*let curH=$cur[0].offsetHeight;
            let wraT=parseFloat($wrapper.css('top'));
            $wrapper.css('top',wraT-curH);*/

            //=>js中基于css获取transform得到的是矩阵
            let curH=$cur[0].offsetHeight;
            tt-=curH;
            $wrapper.css('transform',`translateY(${tt}px)`);
        }
        if (step>=total-1){
            //=>展示完了
            clearInterval(autoTimer);
            closeMessage();
        }
    };

    //=>手动发送message
    let handleSend=function handleSend() {
        $keyBoard.css('transform','translateY(0)').one('transitionend', ()=> {
            //transitionend：监听当前元素transition动画结束的事件（并且有几个样式属性改变，并且执行了过渡效果，事件就会触发执行几次）=>用one方法做事件绑定，只会让其触发一次
            let str='好的，马上介绍！';
            let n=-1;
            let textTimer=null;
            textTimer=setInterval(()=>{
                let originHTML=$textInp.html();
                $textInp.html(originHTML+str[++n]);

                if (n>=str.length-1) {
                    //文字显示完成
                    clearInterval(textTimer);
                    $submit.css('display','block');
                }
            },100);
        })
    };

    //=>点击submit
    let handleSubmit=function handleSubmit() {
        //=>把新创建的li添加到页面中第二个li的后面，并让其显示
        $(`<li class="self">
                <i class="arrow"></i>
                <img src="./img/zf_messageStudent.png" alt="" class="pic">
                ${$textInp.html()}
            </li>`).insertAfter($messageList.eq(1)).addClass('active');
        $messageList=$wrapper.find('li');//=>重要：把新的li放到页面中，我们此时应该重新获取li，让messageList和页面中的li正对应，方便后期根据索引展示对应的li

        //=>该消失的消失
        $textInp.html('');
        $submit.css('display','none');
        $keyBoard.css('transform','translateY(3.7rem)');

        //=>继续向下展示剩余的消息
        autoTimer=setInterval( showMessage,interval);
    };

    //=>closeMessage：关掉message区域
    let closeMessage=function closeMessage() {
        let delayTimer=setTimeout(()=>{//延迟移除，为了看到最后一条信息
            magicMusic.pause();
            $(magicMusic).remove();
            $messageBox.remove();
            clearTimeout(delayTimer);

            /*进入下一个版块：cube板块*/
            cubeRender.init();
        },interval)
    };

    return {
        init: function () {
            $messageBox.css('display','block');

            //=>加载模块立即展示一条信息，后期间隔interval再发送一条信息
            showMessage();
           autoTimer=setInterval( showMessage,interval);

           //=>submit
           $submit.tap(handleSubmit);

           //=>playMusic
            magicMusic.play();
            magicMusic.volume=0.3;
        }
    }
})();

/*cube*/
let cubeRender = (function () {
    let $cubeBox=$('.cubeBox');
    let $cube=$('.cube');
    let $cubeList=$cube.find('li');

    let start=function start(ev) {
        //=>记录手指按下位置的起始坐标
        let point=ev.changedTouches[0];
        this.startX=point.clientX;
        this.startY=point.clientY;
        this.changeX=0;
        this.changeY=0;
    };
    let move=function move(ev) {
        //=>用最新手指的位置 - 起始的位置，记录X/Y轴的偏移
        let point=ev.changedTouches[0];
        this.changeX=point.clientX-this.startX;
        this.changeY=point.clientY-this.startY;
    };
    let end=function end(ev) {
        //=>获取change 、rotate值
        let {changeX, changeY, rotateX, rotateY}=this;
        let isMove=false;
        //=>验证是否发生移动(判断滑动误差)
        if (Math.abs(changeX) > 10 || Math.abs(changeY) > 10){
            isMove=true;
        }else {
            isMove=false;
        }
        //=>只有发生移动才做处理
        if (isMove){
            //1.左右滑动，changeX改变 => 对应旋转rotateY => changeX越大，rotateY越大
            //2.上下滑动，changeY改变 => 对应旋转rotateX=> changeY越大，rotateX越小
            //3.为了让每一次操作旋转角度小一点，我们可以把移动距离的1/3作为旋转的角度即可
            rotateX=rotateX-changeY;
            rotateY=rotateY+changeX;
            //=>赋值给魔方盒子
            $(this).css('transform',`scale(0.6)  rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
            //=>让当前旋转的角度成为下一次起始的角度
            this.rotateX=rotateX;
            this.rotateY=rotateY;
        }
        //=>清空其他记录的自定义属性值
        ['startX', 'startY', 'changeX', 'changeY'].forEach((item)=>{
            this[item]=null;
        });
    };

    return {
        init: function () {
            $cubeBox.css('display','block');

            //=>手指操作cube，让cube跟着旋转
            let cube=$cube[0];
            cube.rotateX=-35;
            cube.rotateY=35;//记录初始的旋转角度（记录到自定义属性上）
            $cube.on('touchstart',start)
                .on('touchmove',move)
                .on('touchend',end);

            //=>点击每一个面，跳转到详情页对应的页面：
            $cubeList.tap(function(){
                $cubeBox.css('display','none');//本区域消失

                //=>跳转到详情区域，通过传递点击的li的索引，让其定位到具体的slide
                let index=$(this).index();//获取点击的li的索引
                detailRender.init(index);
            });
        }
    }
})();

/*detail*/
let detailRender = (function () {
    let $detailBox=$('.detailBox');
    let swiper=null;
    let $dl=$('.page1>dl');

    let swiperInit=function swiperInit() {
        swiper=new Swiper('.swiper-container', {
            //initialSlide :0, //=>初始的slide索引：数字
            //direction : 'vertical',//=>滑动方向=>类型：string默认：horizontal 举例：vertical
            effect : 'coverflow', //=>切换效果，默认为"slide"（位移切换），可设置为'slide'（普通切换、默认）,"fade"（淡入）"cube"（方块）"coverflow"（3d流）"flip"（3d翻转）
            //loop:true //=>swiper有一个bug:3D切换设置loop的时候偶尔会出现无法切换的情况（2D效果没问题）=>无缝切换原理：把真实第一张克隆一份放到末尾，把真实最后一张也克隆一份到开头（真实slide有5张，wrapper中会有7个slide）
            // on:{
            //     transitionEnd: function(){//=>绑定：切换动画完成执行的回调函数
            //         console.log('过渡结束',this.$el);
            //     }
            // }
            on:{
                init:move,
                transitionEnd:move
            }
        });

        //=>实例的私有属性：
        //1. mySwiper.activeIndex 返回当前活动块(激活块)的索引。loop模式下注意该值会被加上复制的slide数。
        //2. mySwiper.slides 获取所有的slide(数组)
        // ...

        //=>实例的公用方法
        //1. mySwiper.slideTo(index, speed, runCallbacks) 切换到指定索引的slide
        // ...
    };

    let move=function move() {
        //this:当前创建的实例
        //1.判断当前是否为第一个slide：如果是让3D菜单展开，如果不是收起
        let activeIndex=this.activeIndex;
        let slideAry=this.slides;
        if (activeIndex===0) {
            //=>如果为第一个slide
            //=>实现下拉3D折叠菜单效果
            $dl.makisu({
                selector:'dd',
                overlap:0.6,
                speed:0.8
            });
            $dl.makisu('open');
        }else {
            //=>other page
            $dl.makisu({
                selector:'dd',
                overlap:0.6,
                speed:0
            });
            $dl.makisu('close');
        }

        //2.滑动哪一页，把当前前面设置对应的id，其余的移除id
        slideAry.each(function(index, item){
            if (activeIndex===index) {
                item.id=`page${index+1}`;
                return;
            }
            item.id=null;
        })

    };

    return {
        init: function (index=0) {
            $detailBox.css('display','block');
            if(!swiper){
                //如果swiper不为null，才初始化，防止重复初始化
                swiperInit();
            }
            swiper.slideTo(index,0);//通过swiper提供的slideTo跳转到swiper对应索引的slide页面(第二个参数是切换的速度：0代表立即切换)
        }
    }
})();

/*HASH路由处理模型*/
//=>开发过程中，由于当前项目版块众多（每一个版块都是一个单例），我们最好规划一种机制：通过标识的判断可以让程序值执行对应版块的内容，这样开发哪个版块，我们就把标识改为啥（HASH路由控制）
let url=window.location.href;//=>获取当前页面的url地址 location.href="xxx"这种写法是让其跳转到指定的xxx页面
let well=url.indexOf('#');
let hash=well===-1?null:url.substr(well+1);

switch (hash) {
    case "loading":
        loadingRender.init();
        break;
    case "phone":
        phoneRender.init();
        break;
    case "message":
        messageRender.init();
        break;
    case "cube":
        cubeRender.init();
        break;
    case "detail":
        detailRender.init();
        break;
    default:
        loadingRender.init();
}
