webpackJsonp([6],{"22tm":function(s,e){},"7BAY":function(s,e){},YqPk:function(s,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var t=i("hkgs"),v={render:function(){var s=this,e=s.$createElement,i=s._self._c||e;return s.overviewList?i("section",{staticClass:"issues"},[i("h2",[s._v("安全信息")]),s._v(" "),i("div",[i("div",{staticClass:"issues-highest"},[i("p",[i("i",{staticClass:"overview-warning icon-red"},[s._v("\n          ")]),s._v(" "),i("span",[s._v(s._s(s.overviewList.high))])]),s._v(" "),i("p",[s._v("高危漏洞")])]),s._v(" "),i("div",{staticClass:"issues-highest"},[i("p",[i("i",{staticClass:"overview-warning icon-orange"},[s._v("\n          ")]),s._v(" "),i("span",[s._v(s._s(s.overviewList.medium))])]),s._v(" "),i("p",[s._v("中间漏洞")])]),s._v(" "),i("div",{staticClass:"issues-highest"},[i("p",[i("i",{staticClass:"overview-warning icon-yellow"},[s._v("\n        ")]),s._v(" "),i("span",[s._v(s._s(s.overviewList.low))])]),s._v(" "),i("p",[s._v("低危漏洞")])]),s._v(" "),i("div",{staticClass:"issues-highest"},[i("p",[i("i",{staticClass:"overview-warning icon-blue"},[s._v("\n        ")]),s._v(" "),i("span",[s._v(s._s(s.overviewList.negligible))])]),s._v(" "),i("p",[s._v("轻微漏洞")])]),s._v(" "),i("div",{staticClass:"issues-highest"},[i("p",[i("i",{staticClass:"overview-warning icon-black"},[s._v("\n        ")]),s._v(" "),i("span",[s._v(s._s(s.overviewList.unknown))])]),s._v(" "),i("p",[s._v("未知漏洞")])])])]):s._e()},staticRenderFns:[]};var a={components:{level:i("VU/8")({name:"level",props:["overviewList"]},v,!1,function(s){i("7BAY")},"data-v-1840ab81",null).exports},data:function(){return{overviewList:""}},created:function(){var s=this,e=this.$route.query;t.c(e).then(function(e){console.log(e.data.data),s.overviewList=e.data.data})}},n={render:function(){var s=this,e=s.$createElement,i=s._self._c||e;return i("div",[s.overviewList?i("section",{staticClass:"msg"},[i("div",[i("div",{staticClass:"msg-wrapper"},[s._m(0),s._v(" "),i("span",[s._v(s._s(s.overviewList.image))])]),s._v(" "),s._m(1),s._v(" "),i("div",{staticClass:"msg-wrapper"},[s._m(2),s._v(" "),i("span",[s._v(s._s(s._f("timeTrans")(s.overviewList.created_at)))])]),s._v(" "),i("div",{staticClass:"msg-wrapper"},[s._m(3),s._v(" "),i("span",[s._v(s._s(s._f("timeTrans")(s.overviewList.updated_at)))])]),s._v(" "),i("div",{staticClass:"msg-wrapper"},[s._m(4),s._v(" "),i("span",[s._v(s._s(s.overviewList.namespace))])])])]):s._e(),s._v(" "),i("hr"),s._v(" "),i("level",{attrs:{overviewList:s.overviewList}})],1)},staticRenderFns:[function(){var s=this.$createElement,e=this._self._c||s;return e("p",[e("i",[this._v("*")]),this._v("储存库/标签：")])},function(){var s=this.$createElement,e=this._self._c||s;return e("div",{staticClass:"msg-wrapper"},[e("p",[e("i",[this._v("*")]),this._v("注册表：")]),this._v(" "),e("span",[this._v("Docker Hub")])])},function(){var s=this.$createElement,e=this._self._c||s;return e("p",[e("i",[this._v("*")]),this._v("镜像创建时间：")])},function(){var s=this.$createElement,e=this._self._c||s;return e("p",[e("i",[this._v("*")]),this._v("最新扫描时间：")])},function(){var s=this.$createElement,e=this._self._c||s;return e("p",[e("i",[this._v("*")]),this._v("操作系统 / 版本 ：")])}]};var r=i("VU/8")(a,n,!1,function(s){i("22tm")},"data-v-19d4dc74",null);e.default=r.exports}});
//# sourceMappingURL=6.d2d9618df099559cd213.js.map