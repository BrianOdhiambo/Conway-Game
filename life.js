function $(selector, container) {
    return (container || document).querySelector(selector);
}

(function () {
    let _ = self.Life = function(seed){
        this.seed = seed;
        this.height = seed.length;
        this.width = seed[0].length;

        this.preBoard  =[];
        this.board = cloneArray(seed);
    };

    _.prototype = {
        next: function () {
            this.preBoard = cloneArray(this.board);

            for (let y = 0; y < this.height; y++){
                for (let x = 0; x < this.width; x++){
                    let neighbors = this.aliveNeighbors(this.preBoard, x, y);
                    let alive = !!this.board[y][x];

                    if (alive){
                        if (neighbors < 2 || neighbors > 3) {
                            this.board[y][x] = 0;
                        }
                    } else {
                        if (neighbors === 3) {
                            this.board[y][x] = 1;
                        }
                    }
                }
            }
        },

        aliveNeighbors: function (array, x, y){

            let prevRow = array[y-1] || [];
            let nextRow = array[y+1] || [];

            return [
                prevRow[x-1], prevRow[x], prevRow[x+1],
                array[y][x-1], array[y][x+1],
                nextRow[x-1], nextRow[x], nextRow[x+1]
            ].reduce(function (prev, cur) {
                return prev + +!!cur;
            }, 0);
        },

        toString: function () {
            return this.board.map(function (row) {
                return row.join(' ');
            }).join('\n');
        }
    };

    // Helpers
    // Only clones 2D arrays
    function cloneArray(array){
        return array.slice().map(function (row) {
            return row.slice();
        })
    }

})();
/*
let game = new  Life([
    [0,0,0,0,0,0],
    [0,0,0,0,0,0],
    [0,0,1,1,1,0],
    [0,1,1,1,0,0],
    [0,0,0,0,0,0],
    [0,0,0,0,0,0]
]);

console.log(game + '');

game.next();

console.log(game + '');

game.next();

console.log(game + '');*/

(function () {
    let _ = self.LifeView = function (table, size) {
        this.grid = table;
        this.size = size;
        this.started = false;
        this.autoplay = false;

        this.createGrid();
    };

    _.prototype = {
        createGrid: function () {
            let me = this;

            let fragment = document.createDocumentFragment();
            this.grid.innerHTML = '';
            this.checkboxes = [];

            for (let y = 0; y < this.size; y++){
                let row = document.createElement('tr');
                this.checkboxes[y] = [];

                for ( let x = 0; x < this.size; x++){
                    let cell = document.createElement('td');
                    let checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    this.checkboxes[y][x] = checkbox;
                    checkbox.coords = [y, x];

                    cell.appendChild(checkbox);
                    row.appendChild(cell);
                }
                fragment.appendChild(row);
            }
            this.grid.addEventListener('change', function (evt) {
                if (evt.target.nodeName.toLowerCase() == 'input'){
                    me.started = false;
                }
            });

            this.grid.addEventListener('keyup', function (evt) {
                let checkbox = evt.target;

                if (checkbox.nodeName.toLowerCase() == 'input'){
                    let coords = checkbox.coords;
                    let y = coords[0];
                    let x = coords[1];

                    switch (evt.keyCode) {
                        case 37: // left
                            if (x > 0){
                                me.checkboxes[y][x-1].focus();
                            }
                            break;
                        case 38: //up
                            if (y > 0){
                                me.checkboxes[y-1][x].focus();
                            }
                            break;
                        case 39: // right
                            if (x < me.size - 1){
                                me.checkboxes[y][x+1].focus();
                            }
                            break;
                        case 40: // down
                            if (y < me.size - 1){
                                me.checkboxes[y+1][x].focus();
                            }
                            break;
                    }
                }
            })

            this.grid.appendChild(fragment);
        },

        get boardArray(){
            return this.checkboxes.map(function (row) {
                return row.map(function (checkbox) {
                    return +checkbox.checked;
                })
            })
        },

        play: function () {
            this.game = new Life(this.boardArray)
            this.started = true;
        },

        next: function () {
            let me = this;
            if (!this.started || this.game){
                this.play();
            }

            this.game.next();

            let board = this.game.board;

            for (let y = 0; y < this.size; y++){
                for (let x = 0; x < this.size; x++){
                    this.checkboxes[y][x].checked = !!board[y][x];
                }
            }
            if (this.autoplay){
                this.timer = setTimeout(function () {
                    me.next();
                }, 1000);
            }
        }
    };

})();

let lifeView = new LifeView(document.getElementById('grid'), 12);

(function () {
    let buttons = {
        next: $('button.next')
    };

    buttons.next.addEventListener('click', function () {
        lifeView.next();
    });

    $('#autoplay').addEventListener('change', function () {
        buttons.next.disabled = this.checked;

        if(this.checked){
            lifeView.autoplay = this.checked;
            lifeView.next();
        } else {
            clearTimeout(lifeView.timer)
        }
    })
})();