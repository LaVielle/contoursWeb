canvas = document.getElementById("myCanvas");

//src = canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);


////////////

////////////

////////////

var blobMap = [];

function FindBlobs(src) {

  console.log("blobScript.js -running...")

  var xSize = src.width,
      ySize = src.height,
      srcPixels = src.data,
      x, y, pos;

  var bullshit = src.getContext('2d').getImageData(0,0,canvas.width,canvas.height);

  //console.log(bullshit);
  //console.log(bullshit.data);

  srcPixels = bullshit.data;
  console.log(bullshit.data);


  //console.log("xSize: " + xSize + " , NIHAOSize: " + ySize);


  // This will hold the indecies of the regions we find
  //var blobMap = [];
  var label = 1;

  // The labelTable remembers when blobs of different labels merge
  // so labelTabel[1] = 2; means that label 1 and 2 are the same blob
  var labelTable = [0];

  // Start by labeling every pixel as blob 0
  for(y=0; y<ySize; y++){
    blobMap.push([]);
    for(x=0; x<xSize; x++){
      blobMap[y].push(0);
    }
  }

  // Temporary variables for neighboring pixels and other stuff
  var nn, nw, ne, ww, ee, sw, ss, se, minIndex;
  var luma = 0;
  var isVisible = 0;


  // Thresholding:
  var levels = 10;
  var minColor = bullshit.data[0];
  var maxColor = bullshit.data[0];

  // Finding min and max color
  for (i = 0; i<bullshit.data.length; i+=4){
    if (bullshit.data[i] > maxColor){
      maxColor = bullshit.data[i];
      console.log("max run");
    }
  }
  for (i = 0; i<bullshit.data.length; i+=4){
    if (bullshit.data[i] < minColor){
      minColor = bullshit.data[i];
      console.log("min run");
    }
  }
  console.log("min: " + minColor + "max: " + maxColor);

  var variance = maxColor - minColor;
  //var threshold = variance/levels;
  var threshold = 170;


  for (tIndex=0; tIndex<variance; tIndex+=threshold){

    // We're going to run this algorithm twice
    // The first time identifies all of the blobs candidates the second pass
    // merges any blobs that the first pass failed to merge
    var nIter = 2;
    while( nIter-- ){

      // We leave a 1 pixel border which is ignored so we do not get array
      // out of bounds errors
      for( y=1; y<ySize-1; y++){
        for( x=1; x<xSize-1; x++){

          pos = (y*xSize+x)*4;

          // We're only looking at the alpha channel in this case but you can
          // use more complicated heuristics
          isVisible = (srcPixels[pos] > tIndex);
          //console.log(srcPixels[pos]);

          if( isVisible ){

            // Find the lowest blob index nearest this pixel
            nw = blobMap[y-1][x-1] || 0;
            nn = blobMap[y-1][x-0] || 0;
            ne = blobMap[y-1][x+1] || 0;
            ww = blobMap[y-0][x-1] || 0;
            ee = blobMap[y-0][x+1] || 0;
            sw = blobMap[y+1][x-1] || 0;
            ss = blobMap[y+1][x-0] || 0;
            se = blobMap[y+1][x+1] || 0;
            minIndex = ww;
            if( 0 < ww && ww < minIndex ){ minIndex = ww; }
            if( 0 < ee && ee < minIndex ){ minIndex = ee; }
            if( 0 < nn && nn < minIndex ){ minIndex = nn; }
            if( 0 < ne && ne < minIndex ){ minIndex = ne; }
            if( 0 < nw && nw < minIndex ){ minIndex = nw; }
            if( 0 < ss && ss < minIndex ){ minIndex = ss; }
            if( 0 < se && se < minIndex ){ minIndex = se; }
            if( 0 < sw && sw < minIndex ){ minIndex = sw; }
    
            // This point starts a new blob -- increase the label count and
            // and an entry for it in the label table
            if( minIndex === 0 ){
              blobMap[y][x] = label;
              labelTable.push(label);
              label += 1;

              //console.log("new blob with label: " + label);
    
            // This point is part of an old blob -- update the labels of the
            // neighboring pixels in the label table so that we know a merge
            // should occur and mark this pixel with the label.
            }else{
              if( minIndex < labelTable[nw] ){ labelTable[nw] = minIndex; }
              if( minIndex < labelTable[nn] ){ labelTable[nn] = minIndex; }
              if( minIndex < labelTable[ne] ){ labelTable[ne] = minIndex; }
              if( minIndex < labelTable[ww] ){ labelTable[ww] = minIndex; }
              if( minIndex < labelTable[ee] ){ labelTable[ee] = minIndex; }
              if( minIndex < labelTable[sw] ){ labelTable[sw] = minIndex; }
              if( minIndex < labelTable[ss] ){ labelTable[ss] = minIndex; }
              if( minIndex < labelTable[se] ){ labelTable[se] = minIndex; }

              blobMap[y][x] = minIndex;

              //console.log("added to blob: " + minIndex);
            }

          // This pixel isn't visible so we won't mark it as special
          }else{
            blobMap[y][x] = 0;
          }
    
        }
      }
    
      // Compress the table of labels so that every location refers to only 1
      // matching location
      var i = labelTable.length;
      while( i-- ){
        label = labelTable[i];
        while( label !== labelTable[label] ){
          label = labelTable[label];
        }
        labelTable[i] = label;
      }
    
      // Merge the blobs with multiple labels
      for(y=0; y<ySize; y++){
        for(x=0; x<xSize; x++){
          label = blobMap[y][x];
          if( label === 0 ){ continue; }
          while( label !== labelTable[label] ){
            label = labelTable[label];
          }
          blobMap[y][x] = label;
        }
      }
    }

    // The blobs may have unusual labels: [1,38,205,316,etc..]
    // Let's rename them: [1,2,3,4,etc..]
    var uniqueLabels = unique(labelTable);
    var i = 0;
    for( label in uniqueLabels ){
      labelTable[label] = i++;
      //console.log("number of uniques: " + i);
    }

    // convert the blobs to the minimized labels
    for(y=0; y<ySize; y++){
      for(x=0; x<xSize; x++){
        label = blobMap[y][x];
        blobMap[y][x] = labelTable[label];
      }
    }


    var ctx = canvas.getContext("2d");

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var id = ctx.createImageData(1,1);
    var d = id.data;
   /* 
    for (var i = 0; i < imgData.data.length; i += 4) {

        imgData.data[i]     = 255;     // red
        imgData.data[i + 1] = 100; // green
        imgData.data[i + 2] = 0; // blue
        imgData.data[i + 3] = 255;

      
        
      }
    ctx.putImageData(imgData, 0, 0);

  */

            var r = 0;
            var g = 1;
            var b = 2;
            var a = 3;

    for(i=0; i<ySize; i++){
          for(j=0; j<xSize; j++){
            
            var bID = blobMap[i][j];

            if(bID > 0)
            {
              d[r] = tIndex;  // red
              d[g] = 0; // green
              d[b] = 0; // blue
              d[a] = 255; // alpha

              //r +=4;
              //g +=4;
              //b +=4;
              //a +=4;

            
              ctx.putImageData(id, j, i);
            }
      }
     
     // ctx.putImageData(imgData, 0, 0); 

    }

  }
 
  // Return the blob data:
  console.log("blobScript.js -done")
  console.log(blobMap);

  return blobMap;

};

////// ////// //////

////// ////// //////


function unique(arr){
/// Returns an object with the counts of unique elements in arr
/// unique([1,2,1,1,1,2,3,4]) === { 1:4, 2:2, 3:1, 4:1 }

    var value, counts = {};
    var i, l = arr.length;
    for( i=0; i<l; i+=1) {
        value = arr[i];
        if( counts[value] ){
            counts[value] += 1;
        }else{
            counts[value] = 1;
        }
    }

    return counts;
}