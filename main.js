
let your_scores = [];

const imas_series = ['as','cg', 'ml', 'sm', 'sc'];
let selected_series = [];


const table_head =
`<table class="table table-striped table-sm overflow-auto table-responsive" style="height:370px;">
<thead><tr><th></th><th>曲名</th><th>作詞</th><th>作曲</th></tr></thead>
<tbody class="small">`;
const table_foot = 
`</tbody></table>`;

function table_content(songs, series){
    let num = 1;
    let content = "";
    for (let i=0; i<songs.length; i++){
        const song = songs[i];
        if (song["シリーズ"]==series && song["作詞"]){
            content += `<tr><td>${num}</td><td>${song["曲名"]}</td><td>${song["作詞"]}</td><td>${song["作曲"]}</td></tr>`;
            num += 1;
        }
    
    };
    return content;
}
function table_check_content(songs, series){
    let num = 1;
    let content = "";
    for (let i=0; i<songs.length; i++){
        const song = songs[i];
        if (song["シリーズ"]==series && song["作詞"]){
            content += `<tr><td><input type="checkbox" name="checkbox" value="${song["ID"]}" onChange="onChangeCheckbox(this.value);"></td><td>${song["曲名"]}</td><td>${song["作詞"]}</td><td>${song["作曲"]}</td></tr>`;
            num += 1;
        }
    
    };
    return content;
}

function setSongSelection(selected){
    for (let imas of imas_series){
        document.getElementById(imas + "_songs").innerHTML = table_head + table_content(songs, imas) + table_foot;
    }
    if (imas_series.indexOf(selected)>-1){
        document.getElementById(selected + "_songs").innerHTML = table_head + table_check_content(songs, selected) + table_foot;
    }


}
setSongSelection('');


/*
window.addEventListener('DOMContentLoaded', function(){
    $.get("scoredsongs.json", (data) => {
        // JSONデータを受信した後に実行する処理
        const songs = $.parseJSON(data);
        alert(songs[0]["ID"]);
    }); 
});
*/
function updateData(chart, labels, dataset){
    //removeData(chart);
    chart.data.labels = labels;
    chart.data.datasets[0].data = dataset;
    chart.update();
}

const barChartData = {
    labels: [],
    datasets: [{
        label: 'ポイント',
        data: [],
    }]
};

const ctx = document.getElementById("graph").getContext("2d");
let chart = new Chart(ctx, {
    type: 'horizontalBar',
    data: barChartData,
    options: {
        responsive: true,
        scales: {
            xAxes: [{
                display: true,
                ticks: {
                    suggestedMin: 0, // minimum will be 0, unless there is a lower value.
                    // OR //
                    beginAtZero: true, // minimum value will be 0.
                    stepSize: 1,
                }
            }]
        }
    }
});

function updateScores(){

    let scores = [];
    $("input[type='checkbox']").filter(":checked").each(function (index, element) {
        const song = songs.find((song) => song.ID === $(element).val());

        for (let i = 0; i < song.scores.length; i++) {
            const artist = song.scores[i]['artist'];

            const score = scores.find((v) => v.artist === artist);

            if (score) {
                score.value += song.scores[i]['value'];
            } else {
                scores.push({artist:artist, value:song.scores[i]['value']});
            }

        }
    });

    scores.sort((a, b) => {
        if (a.value > b.value) return -1;
        if (a.value < b.value) return 1;
        return 0;
    });

    return scores;
}

function updateGraph(){

    const scores = your_scores;

    let labels = [];
    let dataset = [];
    for (let i = 0; i < scores.length; i++){
        labels.push(scores[i].artist);
        dataset.push(scores[i].value);
    }
    updateData(chart, labels, dataset);

}

function table_scored_content(songs, series){
    let num = 1;
    let content = "";
    for (let i=0; i<songs.length; i++){
        const song = songs[i];
        if (song["シリーズ"]==series){
            content += `<tr><td>${song.scores.total_score}</td><td>${song["曲名"]}</td><td>${song["作詞"]}</td><td>${song["作曲"]}</td></tr>`;
            num += 1;
        }
    
    };
    return content;
}

function updateRecommends(){
    let recommended_songs = [];

    for (imas of imas_series){
        //チェックシリーズの場合はスキップ

        if (selected_series.indexOf(imas) > -1){
            continue;
        }

        //チェック以外のシリーズに対しておススメ表を作成
        for (let i = 0; i < songs.length; i++){
            const song = songs[i];
            if (song["シリーズ"]==imas){
                let total_score = 0;
                
                for (let j = 0; j<song.scores.length; j++){
                    const artist = song.scores[j].artist;
                    const value = song.scores[j].value;
                    const score = your_scores.find((v) => v.artist === artist);
                    if (score) {
                        total_score += score.value*value;
    
                    }
                }
                if (total_score > 0) {
                    song.scores.total_score = total_score;
                    recommended_songs.push(song);
                }
            }
            
        }
        recommended_songs.sort((a, b) => {
            if (a.scores.total_score > b.scores.total_score) return -1;
            if (a.scores.total_score < b.scores.total_score) return 1;
            return 0;
        });
        document.getElementById(imas + "_songs").innerHTML = table_head + table_scored_content(recommended_songs, imas) + table_foot;
    }




}

function onChangeCheckbox(){
    your_scores = updateScores();
    updateGraph();
    updateRecommends();
}

$(function(){


    $('.dropdown-menu .dropdown-item').click(function(){
        var visibleItem = $('.dropdown-toggle', $(this).closest('.dropdown'));
        visibleItem.text($(this).text());
        selected_series[0]=$(this).attr("value");
        setSongSelection(selected_series[0]);
    });
});