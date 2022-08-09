// 역이름정보와 역리스트들을 가져옵니다.
let timeDistanceDict = timeDistanceDicts();
let stationsIds = stationsIdsDict();

//svg들을 html에서 가져온다.
const stations = document.getElementsByClassName('station');
const backgroundButtons = document.getElementsByClassName('background');
let hoveredElement = document.getElementById('hoveredStationName');
let clickedId
let targetedIds

// 버튼 변수
let undefinedStationIdList
let switchesBinding = document.getElementsByClassName('switchLine');

// 슬라이더 변수
let sliderMinValue = 600
let sliderMaxValue = 5400
let center_x
let center_y


//스크롤로 줌인 줌아웃을 할 수 있게 해줍니다. 
const mapElement = document.querySelector("#mapBox");
let zoom = 1;
const ZOOM_SPEED = 0.1;

let widthHeight = mapElement.getBoundingClientRect();

document.addEventListener("wheel", function(e) {
    widthHeight = mapElement.getBoundingClientRect();
    //console.log(widthHeight.width, widthHeight.height)
    //console.log(e.offsetX, e.offsetY);
    if (e.deltaY < 0 ) {
        if ( zoom < 3 ){
            mapElement.style.transform = `scale(${(zoom += ZOOM_SPEED)})`;
        }
        console.log(zoom);
    } else {
        if ( zoom > 1 ) {
            mapElement.style.transform = `scale(${(zoom -= ZOOM_SPEED)})`;
        }
        console.log(zoom);
    }
    mapElement.setAttribute('transform-origin', `${e.offsetX} ${e.offsetY}`);
});

// 드래그를 할 수 있게 됩니다.
document.addEventListener("mousemove", function(e) {
    $(function(){
        $('#miniSubway').draggable({
            //드래그 한계를 정해줍니다.
        containment: [  ((widthHeight.width/zoom)/2) - widthHeight.width,   
                        ((widthHeight.width/zoom)/2) - widthHeight.height, 
                        (widthHeight.width/zoom)/2, 
                        (widthHeight.height/zoom)/2 
                    ]
        });
    });
});

//체크 박스가 체크 되어있는 지 확인해 불린으로 리턴합니다.
function is_checked( checkObj_id ) {

    // 1. checkbox element를 찾습니다.
    const checkbox = document.getElementById( checkObj_id );
  
    // 2. checked 속성을 체크합니다.
    const is_checked = checkbox.checked;
  
    // 3. 결과를 출력합니다.
    return is_checked;
};


// 클래스가 switchLine인 스위치들의 on off 여부를 객체로 리턴합니다. { 노선번호 : 불린 , }
function AreSwitchesOnOff() {
    
    switchesOnOff_obj = {};

    class_cnt = document.getElementsByClassName("switchLine").length;

    for (var i = 0; i < class_cnt; i++){

        switch_id = document.getElementsByClassName( "switchLine" )[i].id;
        switchesOnOff_obj[ switch_id.slice(-2) ] = is_checked( switch_id );

    };
    //console.log( switchesOnOff_obj )

    return switchesOnOff_obj;
};

//value 값으로 key 값 얻을 수 있게 해주는 함수 '배열'로 return한다.
function getKeyByValue(obj, value) {
    return Object.keys(obj).filter(k=>obj[k]===value);
}


function moveStation(target) {
    //target의 아이디가 key 값으로 들어 있는 value를 찾아서 그 value가 들어있는 key를 찾는다. 
    //일단 key 값으로 역을 찾습니다.
    let target_id = target.getAttribute('id');
    target_id = target_id.substr(1,10);
    let targetStationName = stationsIds[target_id];

    // 찾은 역을 value 값으로한 key 값(id들을) 찾습니다.
    let targetStationIds = getKeyByValue(stationsIds, targetStationName);

    // 같은 역 이름을 가진, 다른 노선의 역을 표시한 점들의 중앙을 찾아줘야함.
    let temp_cx = 0;
    let temp_cy = 0;
    let lineCount = 0;

    //배열을 for반복할 땐 in이 아니라 of를 쓴다.
    for ( i of targetStationIds ){
        // html에서 요소 찾을 떄 '_' 가 id 앞에 붙어 있으므로 붙여줘야 찾을 수 있음
        temp_id = '_'+ i
        temp = document.getElementById(temp_id) // 요소를 가져온다.
        temp_cx += +temp.getAttribute('cx');
        temp_cy += +temp.getAttribute('cy');
        lineCount += 1;
    };

    // 역들의 x좌표 y좌표 합을 노선의 개수로 나누어 주어 중점을 구한다.
    center_x = Math.round(temp_cx / lineCount);
    center_y = Math.round(temp_cy / lineCount);
    console.log(center_x, center_y);

    // 클릭할 시 역 노선의 두께를 조절합니다.
    anime({
        targets: '.trainLine',
        opacity : '0.2',
        strokeWidth: '2px',
        duration: 1000,
        direction: "alternate",
        easing: 'easeInOutQuad',
        loop: false
    });

    anime({
        targets: '.water',
        opacity: '0.2',
        duration: 1000,
        direction: "alternate",
        easing: 'easeInOutQuad',
        loop: false
    });




    //역이름 띄우기
    //let element = document.getElementById('selectedStationName');
    //element.innerText = `${targetStationName}`;

    /*
    let elementFirstLine = document.getElementById('firstTextLine');
    let elementSecondLine = document.getElementById('secondTextLine');

    // 다른 설정으로 바뀐 뒤 다시 돌아올 때, 설정을 초기화 해줍니다.
    elementFirstLine.setAttribute('text-anchor', 'end')
    elementFirstLine.setAttribute('y', '5600px');
    elementFirstLine.setAttribute('x', '4050px');
    elementSecondLine.setAttribute('text-anchor', 'end')
    elementSecondLine.setAttribute('y', '5600px');
    elementSecondLine.setAttribute('x', '4050px');

    elementFirstLine.style.fontSize ='1100px'
    elementFirstLine.style.letterSpacing = '-65px'

    let firstLine = ''
    let secondLine = ''

    // 세글자, 네글자 후에 끊는 친구들을 따로 목록을 만들어줍니다.
    let threeLetters = [
        "을지로입구", "서울대입구", "한성대입구", "청계산입구", 
        "의정부시청", "의정부중앙", "북한산우이", "캠퍼스타운", 
        "영등포구청", "영등포시장", "모래내시장",
        "을지로3가", "을지로4가", 
        "경전철의정부", "압구정로데오", "신대방삼거리"]
    let fourLetters = ["경기도청북부청사", "송도달빛축제공원"]


    var pattern_spc = /[()]/; //정규식으로 괄호를 설정해준다.
    
    // 부역이름이 있는 역들을 찾고, 그 이후에는 글자 수 대로 분류해간다.
    if( pattern_spc.test(targetStationName) ) {

        // 괄호 안에 들어있는 
        let nm = targetStationName.match(/\(.*\)/g); 
        nm += ""; 
        nm = nm.split("(").join(""); 
        nm = nm.split(")").join("");
        secondLine = nm;

        nm = targetStationName.replace(/\(.*\)/g, '');  
        firstLine = nm;

        if( firstLine.length == 5 ){
            elementFirstLine.setAttribute('y', '900px');
            elementFirstLine.style.fontSize = '880px';
            elementFirstLine.style.letterSpacing = '-52px';        

        } else if ( firstLine.length == 6 ){
            elementFirstLine.setAttribute('y', '750px');
            elementFirstLine.style.fontSize = '730px';
            elementFirstLine.style.letterSpacing = '-45px';   

        } else if ( firstLine.length == 7 ){
            elementFirstLine.setAttribute('y', '660px');
            elementFirstLine.style.fontSize = '645px';
            elementFirstLine.style.letterSpacing = '-52px';

        }

    } else if ( targetStationName == "419민주묘지") {
        firstLine = targetStationName.substr(0,5);
        secondLine = targetStationName.substr(5);

    } else if ( threeLetters.includes(targetStationName)) {
        firstLine = targetStationName.substr(0,3);
        secondLine = targetStationName.substr(3);

    } else if ( fourLetters.includes(targetStationName)) {
        firstLine = targetStationName.substr(0,4);
        secondLine = targetStationName.substr(4);

    } else if ( targetStationName.length <= 4 ) {
        firstLine = targetStationName

    } else if ( targetStationName.length == 5 ) {
        firstLine = targetStationName.substr(0,2);
        secondLine = targetStationName.substr(2);

    } else if ( targetStationName.length == 6 ) {
        firstLine = targetStationName.substr(0,2);
        secondLine = targetStationName.substr(2);

    } else if ( targetStationName.length == 8 ) {
        firstLine = targetStationName.substr(0,3);
        secondLine = targetStationName.substr(3);

    } else if ( targetStationName.length == 9 ) {
        firstLine = targetStationName.substr(0,3);
        secondLine = targetStationName.substr(3);    

    } else {
        firstLine = targetStationName.substr(0,2);
        secondLine = targetStationName.substr(2);
    }

    elementFirstLine.textContent = `${firstLine}`;
    elementSecondLine.textContent = `${secondLine}`;

    opacity_on_list = [`#backgroundStationName`]
    for ( opacity_on_obj of opacity_on_list ){
        anime({
            targets: opacity_on_obj,
            opacity:'1',
            direction: "alternate",
            easing: 'easeOutQuad',
            duration: 1000,
            loop: false,
        });
    }

    */

    opacity_on_list = [`#backgroundStationName`]
    for ( opacity_on_obj of opacity_on_list ){
        anime({
            targets: opacity_on_obj,
            opacity:'0',
            direction: "alternate",
            easing: 'easeOutQuad',
            duration: 1000,
            loop: false,
        });
    };
    
    //역 이름을 넣습니다.
    $( "#selectedStationName" ).text( targetStationName + '에서' )

    //선택된 역들 중심으로 원형 그리드 가져오기
    anime({
        targets: `.timeGrid`,
        translateX: `${center_x - 2100}px`,
        translateY: `${center_y - 2300}px`,
        strokeWidth: '1px',
        opacity: '0.3',
        duration: 1000,
        direction: "alternate",
        easing: 'easeOutQuad',
        loop: false
    });

    //원형 그리드 위에 시간텍스트 올려놓기
    i = 1
    for( timeText of ['#text900', '#text1800', '#text3600', '#text7200']){
        anime({
            targets: `${timeText}`,
            translateX: `${center_x - 2100}px`,
            translateY: `${center_y - 2300}px`,
            opacity: '1',
            duration: 1000,
            direction: "alternate",
            easing: 'easeOutQuad',
            loop: false
        });
        i = i * 2
    };
        

    
    // 역이름을 가진 딕셔너리key를 찾습니다.
    timeDistance = timeDistanceDict[targetStationName]

    //움직이지 않는 역 리스트를 뽑습니다.
    undefinedStationIdList = []

    // 역들을 움직여줍니다.
    for (let station of stations){
        console.log(station);
        let station_id = station.getAttribute('id');
        let station_x = station.getAttribute('cx');
        let station_y = station.getAttribute('cy');
        let timeValue = timeDistance[station_id.substr(1,10)]

        
        if( timeValue == undefined ){ //해당되지 않는 역들은 사라지고, 그렇지 않은 역들은 움직입니다.
            undefinedStationIdList.push( station_id )
            anime({
                targets: `#${station_id}`,
                opacity: '0',
                duration: 500,
                direction: "alternate",
                easing: 'easeInOutQuad',
                loop: false
            });

            anime({
                targets :`.P${station_id}`,
                opacity: '0',
                duration: 500,
                direction: "alternate",
                easing: 'easeInOutQuad',
                loop: false
            });

        } else {
            let distance = Math.round(Math.sqrt((station_x - center_x)**2+ (station_y - center_y)**2 ));
            console.log(station_x, station_y);
            console.log(distance);

            if (distance != 0 ){

                // distance * a 에서 a가 1 일 때 1px -> 1초 / 4일때 1px -> 4초를 뜻하며 숫자가 커질 수록 가까워진다. 
                trans_x = Math.round( -station_x + +center_x + +( timeValue * (station_x - center_x) / (distance * 3)));
                trans_y = Math.round( -station_y + +center_y + +( timeValue * (station_y - center_y) / (distance * 3)));
                console.log(station_id, trans_x, trans_y);

                anime({
                    targets: `#${station_id}`,
                    translateX: `${trans_x}px`,
                    translateY: `${trans_y}px`,
                    r: '4px',
                    opacity: '1',
                    duration: 1000,
                    direction: "alternate",
                    easing: 'easeInOutQuad',
                    loop: false
                });

                anime({
                    targets :`.P${station_id}`,
                    d: `M${station_x},${station_y}l${trans_x},${trans_y}z`,
                    opacity:'1',
                    duration: 1000,
                    direction: "alternate",
                    easing: 'easeInOutQuad',
                    loop: false
                });

                //슬라이더에 해당하는 부분까지만 보여줍니다.
                if ( ( timeValue <= sliderMinValue ) | ( timeValue >= sliderMaxValue ) ){

                    anime({
                        targets: `#${station_id}`,
                        opacity: '0.05',
                        duration: 1000,
                        direction: "alternate",
                        easing: 'easeInOutQuad',
                        loop: false
                    });

                    anime({
                        targets :`.P${station_id}`,
                        opacity:'0.05',
                        duration: 1000,
                        direction: "alternate",
                        easing: 'easeInOutQuad',
                        loop: false
                    });

                }
            }
        }
    }

    // 선택한 역들은 가만히 두기 위해서 맨 마지막에 넣음
    for( i of targetStationIds ){

        temp_id = '_'+ i
        anime({
            targets: `#${temp_id}`,
            translateX: `0px`,
            translateY: `0px`,
            opacity: '1',
            r: '8px',
            duration: 1000,
            direction: "alternate",
            easing: 'easeInOutQuad',
            loop: false
        });

        anime({
            targets :`.P${temp_id}`,
            opacity: '0',
            d: `M${center_x},${center_y}l0,0z`,
            duration: 1000,
            direction: "alternate",
            easing: 'easeInOutQuad',
            loop: false
        });
    }

    //선택되지 않은 역들의 색이 클릭하면 다시 돌아오기 때문에 다시 넣어줍니다.
    SwitchesOnOffObj = AreSwitchesOnOff();
    
    for ( const SwitchesOnOffId in SwitchesOnOffObj ){

        docList = [ "stations","movePath","trainLine" ]
        if ( SwitchesOnOffObj[SwitchesOnOffId] == true ){
            for ( i of docList ){

                anime({
                    targets: `.${i}${SwitchesOnOffId}`,
                    opacity: '0.05',
                    duration: 1000,
                    direction: "alternate",
                    easing: 'easeInOutQuad',
                    loop: false
                });
            }
        }
    }    
    return targetStationIds
}


//노선마다의 색상입니다.
const lineColor = {
    '01': '#0052A4',
    '02': '#009D3E',
    '03': '#EF7C1C',
    '04': '#00A5DE',
    '05': '#996CAC',
    '06': '#CD7C2F',
    '07': '#747F00',
    '08': '#EA545D',
    '09': '#BDB092',
    '21': '#7CA8D5',
    '22': '#ED8B00',
    '63': '#77C4A3',
    '65': '#0090D2',
    '67': '#0C8E72',
    '75': '#F5A200',
    '77': '#D4003B',
    '79': '#003DA5',
    '83': '#81A914',
    '85': '#FDA600',
    '89': '#509F22',
    '91': '#FFCD12',
    '92': '#B0CE18',
    '93': '#A17800',
    '94': '#6789CA',
}

// 처음으로 돌아가는 함수입니다.
function resetMove(){
    anime({
        targets: '.station',
        translateX: '0px',
        translateY: '0px',
        opacity: '1',
        duration: 1000,
        direction: "alternate",
        easing: 'easeInOutQuad',
        loop: false
    });

    for( targetOpacity of [`.timeGrid`, `.gridTimeText`] ){
        anime({
            targets: `${targetOpacity}`,
            opacity : '0',
            duration: 1000,
            direction: "alternate",
            easing: 'easeOutQuad',
            loop: false
        });
    }

    anime({
        targets: '.water',
        opacity : '1',
        duration: 1000,
        direction: "alternate",
        easing: 'easeInOutQuad',
        loop: false
    })

    $( "#selectedStationName" ).text( '역을 선택해주세요' )

    anime({
        targets: `#backgroundStationName`,
        fill: '#FFFFFF',
        opacity: '0',
        direction: "alternate",
        easing: 'easeOutQuad',
        duration: 1000,
        loop: false,
    })

    for (let station of stations){

        let station_id = station.getAttribute('id');
        let station_x = station.getAttribute('cx');
        let station_y = station.getAttribute('cy');
    
        anime({
            targets :`.P${station_id}`,
            d: `M${station_x},${station_y}l0,0z`,
            opacity: '0',
            duration: 1000,
            direction: "alternate",
            easing: 'easeInOutQuad',
            loop: false
        })
    }

    //노선마다 색을 넣어줍니다.
    for ( let key in lineColor ){
        anime({
            targets: `.trainLine${key}`,
            stroke : `${lineColor[key]}`,
            strokeWidth: '1.5px',
            opacity: 1,
            duration: 1000,
            direction: "alternate",
            easing: 'easeInOutQuad',
            loop: false
        })
    }

    //띄우는 글씨도 다시 돌려 놓습니다.
    clickedId = undefined;

    //센터 값도 다시 돌려 놓습니다.
    center_x = undefined;
    center_y = undefined;

    console.log('Reset!')
}

// id에서 역이름으로 바꿔주는 함수
function idToName(id){
    id = id.substr(1,10);
    let targetStationName = stationsIds[id];
    return targetStationName
}

// 초를 넣으면 분과 초 string으로 표현해주는 함수
function secToMin(sec){
    toMin = parseInt( sec / 60 );
    if ( 30 > sec % 60 ){
        minSec = `${toMin}분`
    } else {
        minSec = `${toMin + 1}분`
    }
    return minSec
}


let drag = false;

//배경의 rect과 water를 누르면 resetMove함수 실행
for (let backgroundButton of backgroundButtons)

    // 드래그를 하지 않은 클릭만 구별
    backgroundButton.addEventListener(
        'mousedown', () => drag = false);
  
    document.addEventListener(
        'mousemove', () => drag = true);
  
    document.addEventListener(
        'mouseup', function(e){
            if ( drag == false ) {
                resetMove();
                }
            });


//모든 역에 해당하는 내용입니다.
for (let station of stations){
    let station_id = station.getAttribute('id');
    let station_x = station.getAttribute('cx');
    let station_y = station.getAttribute('cy');

    //퍼지는 선의 첫 출발 위치를 잡아준다.
    anime({
        targets :`.P${station_id}`,
        d: `M${station_x},${station_y}l0,0z`,
        duration: 1000,
        direction: "alternate",
        easing: 'easeInOutQuad',
        loop: false
    })


    //클릭하면 클릭된 역을 변수로 movesStation함수 실행
    station.addEventListener('click', function(e){
        clicked = e.currentTarget

        clickedId = clicked.getAttribute('id');
        targetedIds = moveStation(clicked);
    });

    //커서가 역 위로 올라올 때
    station.addEventListener('mouseenter',function(e){
        
        anime({
            targets: `#${station_id}`,
            r : '12',
            duration: 200,
            direction: "alternate",
            easing: 'easeInOutQuad',
            loop: false
        });

        // 선택을 안 했다면 이름만, 선택을 했다면 이름과 시간을 띄웁니다
        let stationName = idToName(station_id)



        if (clickedId == undefined ){
            
            //hoveredElement.textContent = `${stationName}`;
            $( "#selectedStationName" ).text( stationName + '에서' )

        } else {
            let clickedName = idToName(clickedId)
            let timeDistance = timeDistanceDict[clickedName]
            let time = timeDistance[station_id.substr(1,10)]
            time = secToMin( time )
            //hoveredElement.textContent = `${stationName} ${time}`;
            
            var pattern_spc = /[()]/; //정규식으로 괄호를 설정해준다.
            // 부역이름이 있는 역들을 찾고, 그 이후에는 글자 수 대로 분류해간다.
            if( pattern_spc.test(stationName) ) {

                // 괄호 안에 들어있는 
                let nm = stationName.match(/\(.*\)/g); 
                nm += ""; 
                secondLine = nm;

                nm = stationName.replace(/\(.*\)/g, '');  
                firstLine = nm;

                $( "#selectedStationName2" ).text( firstLine )
                $( "#selectedStationName3" ).text( secondLine + '까지' )

            } else {
                $( "#selectedStationName2" ).text( stationName + '까지' )
                $( "#selectedStationName3" ).text( '' )

            }
            $( "#selectedStationTime" ).text( time )

        }

        /*
        anime({
            targets:"#hoveredStationName",
            translateX: `${+station_x + 30}px`,
            translateY: `${+station_y - 20}px`,
            opacity: '1',
            direction: "alternate",
            easing: 'steps(1)',
            duration: 0
        });
        */

        anime({
            targets:"#hoverdStation",
            cx: `${station_x}px`,
            cy: `${station_y}px`,
            easing: 'steps(1)',
            duration: 0,
            loop: false
        });

        anime({
            targets:"#hoverdStation",
            r: '4',
            direction: "alternate",
            easing: 'easeInOutQuad',
            duration: 0,
            loop: false
        });


    });

    //커서가 역 위를 떠날 때
    station.addEventListener('mouseleave',function(e){

        anime({
            targets: `#${station_id}`,
            r : '4',
            duration: 200,
            direction: "alternate",
            easing: 'easeInOutQuad',
            loop: false
        });

        anime({
            targets:"#hoveredStationName",
            opacity: '0',
            duration: 0,
            loop: false
        });

        anime({
            targets:"#hoverdStation",
            r: '0',
            direction: "alternate",
            easing: 'easeInOutQuad',
            duration: 0,
            loop: false
        });   
    });
}

//노선스위치과 시간바로 거르고 불투명도를 조절하는 함수
function render(){

    SwitchesOnOffObj = AreSwitchesOnOff();
    
        for ( const SwitchesOnOffId in SwitchesOnOffObj ){
    
            docList = [ "stations","movePath","trainLine" ]
            if ( SwitchesOnOffObj[SwitchesOnOffId] == true ){

                for ( i of docList ){
                    anime({
                        targets: `.${i}${SwitchesOnOffId}`,
                        opacity: '0.05',
                        duration: 500,
                        direction: "alternate",
                        easing: 'easeInOutQuad',
                        loop: false
                    });
                }

            } else {    

                let onStationList = document.getElementsByClassName(`stations${SwitchesOnOffId}`);

                for ( station of onStationList){
                    let station_id = station.getAttribute('id');
                    let station_x = station.getAttribute('cx');
                    let station_y = station.getAttribute('cy');
                    let timeValue = timeDistance[station_id.substr(1,10)]

                    if( timeDistance[station_id.substr(1,10)] == undefined ){ //해당되지 않는 역들은 사라지고, 그렇지 않은 역들은 움직입니다.
            
                    } else {
                        let distance = Math.round(Math.sqrt((station_x - center_x)**2+ (station_y - center_y)**2 ));
                        if (distance != 0 ){

                            //슬라이더에 해당하는 부분까지만 보여줍니다.
                            if ( ( timeValue <= sliderMinValue ) | ( timeValue >= sliderMaxValue ) ){
                                anime({
                                    targets: `#${station_id}`,
                                    opacity: '0.05',
                                    duration: 1000,
                                    direction: "alternate",
                                    easing: 'easeInOutQuad',
                                    loop: false
                                });
            
                                anime({
                                    targets :`.P${station_id}`,
                                    opacity:'0.05',
                                    duration: 1000,
                                    direction: "alternate",
                                    easing: 'easeInOutQuad',
                                    loop: false
                                });
            
                            } else {
                                anime({
                                    targets: `#${station_id}`,
                                    opacity: '1',
                                    duration: 1000,
                                    direction: "alternate",
                                    easing: 'easeInOutQuad',
                                    loop: false
                                });
            
                                anime({
                                    targets :`.P${station_id}`,
                                    opacity:'1',
                                    duration: 1000,
                                    direction: "alternate",
                                    easing: 'easeInOutQuad',
                                    loop: false
                                });
                            }
                        }
                    }
                }
            }
        }

        for ( i of undefinedStationIdList ){
            anime({
                targets: `#${i}`,
                opacity: '0',
                duration: 500,
                direction: "alternate",
                easing: 'easeInOutQuad',
                loop: false
            });
    
            anime({
                targets :`.P${i}`,
                opacity: '0',
                duration: 500,
                direction: "alternate",
                easing: 'easeInOutQuad',
                loop: false
            });
        }
}

// 버튼을 누를 때 발생하는 이벤트입니다. 
for ( i of switchesBinding ){
    i.addEventListener('change', function(e) {
        render()
        /*
        SwitchesOnOffObj = AreSwitchesOnOff();
    
        for ( const SwitchesOnOffId in SwitchesOnOffObj ){
    
            docList = [ "stations","movePath","trainLine" ]
            if ( SwitchesOnOffObj[SwitchesOnOffId] == true ){

                for ( i of docList ){
                    anime({
                        targets: `.${i}${SwitchesOnOffId}`,
                        opacity: '0.05',
                        duration: 500,
                        direction: "alternate",
                        easing: 'easeInOutQuad',
                        loop: false
                    });
                }

            } else {    

                let onStationList =document.getElementsByClassName(`stations${SwitchesOnOffId}`);

                for ( station of onStationList){
                    let station_id = station.getAttribute('id');
                    let station_x = station.getAttribute('cx');
                    let station_y = station.getAttribute('cy');
            
                    if( timeDistance[station_id.substr(1,10)] == undefined ){ //해당되지 않는 역들은 사라지고, 그렇지 않은 역들은 움직입니다.
            
                    } else {
                        let distance = Math.round(Math.sqrt((station_x - center_x)**2+ (station_y - center_y)**2 ));
                        if (distance != 0 ){

                            //슬라이더에 해당하는 부분까지만 보여줍니다.
                            if ( ( distance*3 <= sliderMinValue ) | (distance*3 >= sliderMaxValue ) ){
                                anime({
                                    targets: `#${station_id}`,
                                    opacity: '0.05',
                                    duration: 1000,
                                    direction: "alternate",
                                    easing: 'easeInOutQuad',
                                    loop: false
                                });
            
                                anime({
                                    targets :`.P${station_id}`,
                                    opacity:'0.05',
                                    duration: 1000,
                                    direction: "alternate",
                                    easing: 'easeInOutQuad',
                                    loop: false
                                });
            
                            } else {
                                anime({
                                    targets: `#${station_id}`,
                                    opacity: '1',
                                    duration: 1000,
                                    direction: "alternate",
                                    easing: 'easeInOutQuad',
                                    loop: false
                                });
            
                                anime({
                                    targets :`.P${station_id}`,
                                    opacity:'1',
                                    duration: 1000,
                                    direction: "alternate",
                                    easing: 'easeInOutQuad',
                                    loop: false
                                });
                            }
                        }
                    }
                }
            }
        }

        for ( i of undefinedStationIdList ){
            anime({
                targets: `#${i}`,
                opacity: '0',
                duration: 500,
                direction: "alternate",
                easing: 'easeInOutQuad',
                loop: false
            });
    
            anime({
                targets :`.P${i}`,
                opacity: '0',
                duration: 500,
                direction: "alternate",
                easing: 'easeInOutQuad',
                loop: false
            });
        }

        */

    });
}



// 슬라이더
$( function() {

    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 7200,
      values: [ 600, 5400 ],
      step: 5,
      slide: function( event, ui ) {

        $( "#timeBar_1" ).text( secToMin( ui.values[ 0 ] ) );
        $( "#timeBar_2" ).text( secToMin( ui.values[ 1 ] ) );

        sliderMinValue = ui.values[ 0 ]
        sliderMaxValue = ui.values[ 1 ]

        // 슬라이더가 움직이고, 센터 함수의 값이 있으면 
        if ( center_x != undefined ) {
            render()
            /*
            for (let station of stations){
                let station_id = station.getAttribute('id');
                let station_x = station.getAttribute('cx');
                let station_y = station.getAttribute('cy');
        
                if( timeDistance[station_id.substr(1,10)] == undefined ){ //해당되지 않는 역들은 사라지고, 그렇지 않은 역들은 움직입니다.
        
                } else {
                    let distance = Math.round(Math.sqrt((station_x - center_x)**2+ (station_y - center_y)**2 ));
                    if (distance != 0 ){

                        //슬라이더에 해당하는 부분까지만 보여줍니다.
                        if ( ( distance*3 <= sliderMinValue ) | (distance*3 >= sliderMaxValue ) ){
                            anime({
                                targets: `#${station_id}`,
                                opacity: '0.05',
                                duration: 1000,
                                direction: "alternate",
                                easing: 'easeInOutQuad',
                                loop: false
                            });
        
                            anime({
                                targets :`.P${station_id}`,
                                opacity:'0.05',
                                duration: 1000,
                                direction: "alternate",
                                easing: 'easeInOutQuad',
                                loop: false
                            });
        
                        } else {
                            anime({
                                targets: `#${station_id}`,
                                opacity: '1',
                                duration: 1000,
                                direction: "alternate",
                                easing: 'easeInOutQuad',
                                loop: false
                            });
        
                            anime({
                                targets :`.P${station_id}`,
                                opacity:'1',
                                duration: 1000,
                                direction: "alternate",
                                easing: 'easeInOutQuad',
                                loop: false
                            });
                        }
                    }
                }
            }
            */
        }
      }
    });
    
    $( "#timeBar_1" ).text(  secToMin( $( "#slider-range" ).slider( "values", 0 ) ) );
    $( "#timeBar_2" ).text(  secToMin( $( "#slider-range" ).slider( "values", 1 ) ) );

  });