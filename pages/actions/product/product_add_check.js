/***************************************************
 *
 * 商品追加 画像アップロードアクション
 *
 ***************************************************/
module.exports = [{
  execute: function() {
      var me = this;
      var upfile = me.req.files.upfile;
      var dir = me.paths.public + '/upload/';
      NX.Fs.rename(
          upfile.path,
          dir + upfile.name,
          function (err) {
              if(err) {
                  throw err;
              }
              me.set('upfilename', upfile.name);
              me.end();
          }
      );
  }
}];