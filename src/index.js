module.exports = function solveSudoku(matrix) {
  // your solution
  const filledSet = [1,2,3,4,5,6,7,8,9];

  let probableRowValues = getProbableRowValues(matrix, filledSet);
  let probableCollValues = getProbableCollValues(matrix, filledSet);
  let probableSegmentValues = getProbableSegmentValues(matrix, filledSet);
  let probableValues = getProbableValues(probableRowValues, probableCollValues, probableSegmentValues, filledSet);

  clearProbableValues(probableValues, filledSet);

  let copy = null;

  while (!isResolved(probableValues)) {
    let b1 = false;
    let b2 = false;
    let b3 = false;
    do {
      b1 = getProbableValues1(probableValues, filledSet);
      if (!check(probableValues, filledSet)) {
        break;
      }
      b2 = getProbableValues2(probableValues, filledSet);
      if (!check(probableValues, filledSet)) {
        break;
      }
      b3 = getProbableValues3(probableValues, filledSet);
      if (!check(probableValues, filledSet)) {
        break;
      }
    } while (b1 || b2 || b3);

    if (!isResolved(probableValues)) {
      if (!check(probableValues, filledSet)) {
        probableValues = copy;
        setProbableValue(probableValues, filledSet, 1);
      } else {
        copy = copyProbableValues(probableValues);
        setProbableValue(probableValues, filledSet, 0);
      }
    }
  }

  
  function copyProbableValues(pvs) {
    let copy = pvs.map((row) => {
      return row.map((cell) => {
        let set = new Set();
        cell.forEach((value) => {
          set.add(value);
        });
        return set;
      });
    });
    return copy;
  }

function getProbableRowValues(matrix, filledSet) 
{
  let probableRowValues = matrix.reduce((prvs, row) => {
      prvs.push(row.reduce((s, cell) => {
        s.delete(cell); 
        return s;
      }, new Set(filledSet))); 
      return prvs;
    }, []);
    //console.log(probableRowValues);

    return probableRowValues;
}

function getProbableCollValues(matrix, filledSet) 
{
  let probableCollValues = [];
    for (let i = 0; i < 9; i++) {
      probableCollValues.push(matrix.reduce((pcvs, row) => {
        pcvs.delete(row[i]); 
        return pcvs;
      }, new Set(filledSet)));
    }
    //console.log(probableCollValues);

    return probableCollValues;
}

function getProbableSegmentValues(matrix, filledSet) 
{
  let probableSegmentValues = [];
    for (let i = 0; i < 9; i++) {
      let [r, c] = [Math.floor(i / 3) * 3, (i % 3) * 3];
      probableSegmentValues.push(matrix.slice(r, r+3).reduce((psvs, row) => {
        return row.slice(c, c+3).reduce((psvs, cell) => {
          psvs.delete(cell); 
          return psvs;
        }, psvs);
      }, new Set(filledSet)));
    }
    //console.log(probableSegmentValues);

    return probableSegmentValues;
}

function getProbableValues(probableRowValues, probableCollValues, probableSegmentValues, filledSet) 
{
  let probableValues = matrix.reduce((pvs, row, i) => {
      pvs.push(row.reduce((cells, cell, j) => {
        let set = new Set();
        if (cell == 0) {
          let s = Math.floor(i / 3) * 3 + Math.floor(j / 3);
          probableRowValues[i].forEach((value) => {
            if (probableCollValues[j].has(value) && probableSegmentValues[s].has(value)) {
              set.add(value);
            }
          });
        } else {
          set.add(cell);
        }
        cells.push(set);
        return cells;
      }, [])); 
      return pvs;
    }, []);
    //console.log(probableValues);

    return probableValues;
}

function getSudoku(probableValues)
{
  let sudoka = [];
  for (let i = 0; i < 9; i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
      let arr = [...probableValues[i][j]];
      row.push(arr[0]);
    }
    sudoka.push(row);
  }
  return sudoka;
}

function setProbableValue(probableValues_, filledSet, index)
{
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (probableValues_[i][j].size == 2) {
        //console.log(probableValues_[i][j]);

        let arr = [...probableValues_[i][j]];
        //console.log(arr);

        probableValues_[i][j] = new Set([arr[index]]);
        //console.log(probableValues_[i][j]);

        clearProbableValues(probableValues_, filledSet);
        return;
      }
    }
  }
}

function check(probableValues) {
  for (let i = 0; i < 9; i++) {
    let n = 0;
    let s = probableValues[i].reduce((s, cell) => {
      if (cell.size > 1) {
        n++;
        cell.forEach((value) => {
          s.add(value);
        });
      }
      return s;
    },new Set()); 

    if (s.size < n) {
      //console.log("check row");
      return false;
    }     
  }

  for (let j = 0; j < 9; j++) {
    let n = 0;
    let s = probableValues.reduce((s, row) => {
      if (row[j].size > 1) {
        n++;
        row[j].forEach((value) => {
          s.add(value);
        });
      }
      return s;
    },new Set()); 

    if (s.size < n) {
      //console.log("check call");
      return false;
    }     
  }

  for (let s = 0; s < 9; s++) {
    let n = 0;
    let set= new Set();
    for (let i = Math.floor(s / 3) * 3; i < Math.floor(s / 3) * 3 + 3; i++) {
      for (let j = (s % 3) * 3; j < (s % 3) * 3 + 3; j++) {

        if (probableValues[i][j].size > 1) {
          n++;
          probableValues[i][j].forEach((value) => {
            set.add(value);
          });
        }
      }
    }

    if (set.size < n) {
      //console.log("check segment");
      return false;
    }  
  }

  return true;
}

function isResolved(probableValues)
{
  let isResolved = true;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (probableValues[i][j].size > 1) {
        isResolved = false;
        break;
      }
    }
  }
  return isResolved;
}

function getProbableValues1(probableValues, filledSet)
{
  let b = false;

  for (let i = 0; i < 9; i++) {
    (new Set(filledSet)).forEach((value) => {

      let pos = probableValues[i].reduce((p, cell, j) => {
        if (cell.has(value) && cell.size > 1) {
          p.push(j);
        }
        return p;
      }, []); 

      if (pos.length == 1) {
        probableValues[i][pos[0]] = new Set([value]);
        clearProbableValues(probableValues, filledSet);
        b = true;
      }     
    });

  }
  //console.log(probableValues);
  //console.log(b);

  return b;
}

function getProbableValues2(probableValues, filledSet)
{
  let b = false;

  for (let j = 0; j < 9; j++) {
    (new Set(filledSet)).forEach((value) => {
      let pos = probableValues.reduce((pos, row, i) => {
        if (row[j].has(value) && row[j].size > 1) {
          pos.push(i);
        }
        return pos;
      }, []); 

      if (pos.length == 1) {
        probableValues[pos[0]][j] = new Set([value]);
        clearProbableValues(probableValues, filledSet);
        b = true;
      }     
    });
  }
  //console.log(probableValues);
  //console.log(b);

  return b;
}

function getProbableValues3(probableValues, filledSet)
{
  let b = false;

  for (let s = 0; s < 9; s++) {

    (new Set(filledSet)).forEach((value) => {

      let pos = [];
      for (let r = Math.floor(s / 3) * 3; r < Math.floor(s / 3) * 3 + 3; r++) {
        for (let c = (s % 3) * 3; c < (s % 3) * 3 + 3; c++) {
          if (probableValues[r][c].has(value) && probableValues[r][c].size > 1) {
            pos.push([r, c]);
          }
        }
      }

      if (pos.length == 1) {
        probableValues[pos[0][0]][pos[0][1]] = new Set([value]);
        clearProbableValues(probableValues, filledSet);
        b = true;
      }   
    });

  }
  //console.log(probableValues);
  //console.log(b);

  return b;
}

function clearProbableValues(probableValues, filledSet)
{
  let b = false;

  do {
    b = false;
    //console.log("clearProbableValues");

    for (let i = 0; i < 9; i++) {
      (new Set(filledSet)).forEach((value) => {

        for (let j = 0; j < 9; j++) {
          if (probableValues[i][j].has(value) && probableValues[i][j].size == 1) {
            for (let c = 0; c < 9; c++) {
              if (j != c) {
                if (probableValues[i][c].has(value) && probableValues[i][c].size > 1) {
                  probableValues[i][c].delete(value);
                  b = true;
                  //console.log([i, c]);
                }
              }
            }
          }
        }

      });
    }

    for (let j = 0; j < 9; j++) {
      (new Set(filledSet)).forEach((value) => {

        for (let i = 0; i < 9; i++) {
          if (probableValues[i][j].has(value) && probableValues[i][j].size == 1) {
            for (let r = 0; r < 9; r++) {
              if (i != r) {
                if (probableValues[r][j].has(value) && probableValues[r][j].size > 1) {
                  probableValues[r][j].delete(value);
                  b = true;
                  //console.log([r, j]);
                }
              }
            }
          }
        }

      });
    }

    for (let s = 0; s < 9; s++) {
      (new Set(filledSet)).forEach((value) => {

        for (let i = Math.floor(s / 3) * 3; i < Math.floor(s / 3) * 3 + 3; i++) {
          for (let j = (s % 3) * 3; j < (s % 3) * 3 + 3; j++) {

            if (probableValues[i][j].has(value) && probableValues[i][j].size == 1) {

              for (let r = Math.floor(s / 3) * 3; r < Math.floor(s / 3) * 3 + 3; r++) {
                for (let c = (s % 3) * 3; c < (s % 3) * 3 + 3; c++) {
                  if (i != r && j != c) {
                    if (probableValues[r][c].has(value) && probableValues[r][c].size > 1) {
                      probableValues[r][c].delete(value);
                      b = true;
                      //console.log([r, c]);
                    }
                  }
                }
              }
            }
          }
        }

      });

    }
  } while (b);
}


return getSudoku(probableValues);


}
  