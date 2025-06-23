// Copyright (c) 2014 International Aid Transparency Initiative (IATI)
// Licensed under the MIT license whose full text can be found at http://opensource.org/licenses/MIT


const view_list_transactions={}
export default view_list_transactions
view_list_transactions.name="view_list_transactions"

import ctrack     from "./ctrack.js"
import plate      from "./plate.js"
import iati       from "./iati.js"
import fetcher    from "./fetcher.js"
import csvw       from "./csvw.js"
import views      from "./views.js"
import refry      from "../../dstore/js/refry.js"
import iati_codes from "../../dstore/json/iati_codes.json"
import crs        from "../../dstore/json/crs.js"

let crs_year=crs.donors



var commafy=function(s) { return (""+s).replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
		return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,"); }) };

function html_encode(value){ return $('<div/>').text(value).html(); }

// the chunk names this view will fill with new data
view_list_transactions.chunks=[
	"list_transactions_datas",
	"list_transactions_count",
];

//
// display the view
//
view_list_transactions.view=function()
{
	view_list_transactions.chunks.forEach(function(n){ctrack.chunk(n,"{spinner_in_table_row}");});
	ctrack.setcrumb(1);
	ctrack.change_hash();
	view_list_transactions.ajax({q:ctrack.hash});
};

//
// Perform ajax call to get data
//
view_list_transactions.ajax=function(args)
{
	args=args || {};
	args.zerodata=args.zerodata||"{alert_no_data1}";

	var dat={
			"from":"act,trans",
			"limit":args.limit || -1,
			"select":ctrack.convert_str("sum_of_percent_of_trans")+",aid,funder_ref,title,reporting,reporting_ref",
			"groupby":"aid",
			"orderby":"1-",
			"trans_code":"D|E",
		};
	var year=dat.year || ctrack.hash.year;
	if(year)
	{
		dat["trans_day_gteq"]=(parseInt(year)+0)+"-"+ctrack.args.newyear;
		dat["trans_day_lt"]=(parseInt(year)+1)+"-"+ctrack.args.newyear;
	}
	fetcher.ajax_dat_fix(dat,args,"trans");
	if(args.output=="count") // just count please
	{
		dat.select="count";
		delete dat.limit;
		delete dat.orderby;
		delete dat.groupby;
	}

	fetcher.ajax(dat,function(data){
//		console.log("fetch transactions "+year);
//		console.log(data);

		if(args.output=="count")
		{
			ctrack.chunk(args.chunk || "list_transactions_count",commafy(data.rows[0]["count"]));
			view_stats.calc();
		}
		else
		{
			var s=[];
			var total=0;
			ctrack.args.chunks["table_header_amount"]=undefined;
			if((data.rows.length==0)&&(args.zerodata))
			{
				s.push( plate.replace(args.zerodata,{}) );
				ctrack.args.chunks["table_header_amount"]="";
			}
			ctrack.chunk("list_transactions_count",data.rows.length);
			var a=[];
			for(var i=0;i<data.rows.length;i++)
			{
				var v=data.rows[i];
				var d={};
				d.num=i+1;
				d.funder_ref=v.funder_ref;
				d.aid=ctrack.encodeURIComponent(v.aid);
				d.title=html_encode(v.title || v.aid || "N/A");
				d.reporting=iati_codes.publisher_names[v.reporting_ref] || v.reporting || v.reporting_ref || "N/A";
				total+=ctrack.convert_num("sum_of_percent_of_trans",v);
				d.amount_num=Math.floor(ctrack.convert_num("sum_of_percent_of_trans",v));
				d.amount=commafy(""+d.amount_num);
				d.currency=ctrack.display_usd;
				a.push(d);
				s.push( plate.replace(args.plate || "{list_transactions_data}",d) );
			}
			ctrack.chunk(args.chunk || "list_transactions_datas",s.join(""));
			ctrack.chunk("total",commafy(""+Math.floor(total)));

			var p=function(s)
			{
				s=s || "";
				s=s.replace(/[,]/g,"");
				return parseInt(s);
			}
			var cc=[];
			cc[0]=["iati-identifier","title","reporting-org","total-transaction","currency","link","transaction-type"];
			a.forEach(function(v){
				cc[cc.length]=[decodeURIComponent(v.aid),v.title,v.reporting,v.amount_num,v.currency,ctrack.origin+"/ctrack.html#view=act&aid="+v.aid];
			});
			ctrack.chunk((args.chunk || "list_transactions_datas")+"_csv","data:text/csv;charset=UTF-8,"+ctrack.encodeURIComponent(csvw.arrayToCSV(cc)));

		}
		if(args.callback){args.callback(data);}
		ctrack.display();
	});
}
