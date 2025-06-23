// Copyright (c) 2014 International Aid Transparency Initiative (IATI)
// Licensed under the MIT license whose full text can be found at http://opensource.org/licenses/MIT


const view_list_activities={}
export default view_list_activities
view_list_activities.name="view_list_activities"

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
view_list_activities.chunks=[
	"list_activities_datas",
	"list_activities_count",
];

//
// display the view
//
view_list_activities.view=function()
{
	view_list_activities.chunks.forEach(function(n){ctrack.chunk(n,"{spinner_in_table_row}");});
	ctrack.setcrumb(1);
	ctrack.change_hash();
	view_list_activities.ajax({q:ctrack.hash});
};

//
// Perform ajax call to get data
//
view_list_activities.ajax=function(args)
{
	args=args || {};
	args.zerodata=args.zerodata||"{alert_no_data1}";

	var dat={
			"from":"act",
			"limit":args.limit || -1,
			"select":"title,aid,funder_ref,"+ctrack.convert_str("commitment")+","+ctrack.convert_str("spend")+",reporting,reporting_ref,day_start,day_end,status_code",
			"distincton":"aid",
		};

	fetcher.ajax_dat_fix(dat,args);

// cant use for postgres, must fix code...
//	delete dat.orderby;
//if(dat.orderby){ dat.orderby=dat.orderby+",aid"; }

	if(args.output=="count") // just count please
	{
		dat.select="count_aid";
		delete dat.limit;
		delete dat.orderby;
		delete dat.groupby;
		delete dat.distincton;
	}
		
	fetcher.ajax(dat,function(data){
		if(args.output=="count")
		{
			ctrack.chunk(args.chunk || "list_activities_count",commafy(data.rows[0]["count_aid"]));
			views.stats.calc();
		}
		else
		{
			
			if(args.compare)
			{
				data.rows.sort(args.compare);
			}

			var s=[];
			ctrack.args.chunks["table_header_amount"]=undefined;
			if((data.rows.length==0)&&(args.zerodata))
			{
				s.push( plate.replace(args.zerodata,{}) );
				ctrack.args.chunks["table_header_amount"]="";
			}
			ctrack.chunk("list_activities_count",data.rows.length);
			var a=[];
			for(var i=0;i<data.rows.length;i++)
			{
				var v=data.rows[i];
				var d={};
				d.num=i+1;
				d.funder=v.funder || "N/A";
				d.aid=ctrack.encodeURIComponent(v.aid || "N/A");
				d.title=html_encode(v.title || v.aid || "N/A");
				d.status_code=v.status_code || "N/A";
				
				d.date_start="N/A"
				d.date_end="N/A"
				if(v.day_start!==null) { d.date_start=fetcher.get_nday(v.day_start); }
				if(v.day_end  !==null) { d.date_end  =fetcher.get_nday(v.day_end  ); }

				d.reporting=iati_codes.publisher_names[v.reporting_ref] || v.reporting || v.reporting_ref || "N/A";
				d.commitment=commafy(""+Math.floor(ctrack.convert_num("commitment",v)));
				d.spend=commafy(""+Math.floor(ctrack.convert_num("spend",v)));
				d.currency=ctrack.display_usd;
				d.pct=0;
				if( ctrack.convert_not_zero("commitment",v) )
				{
					d.pct=Math.floor(0.5+100*ctrack.convert_num("spend/commitment",v));
					if(d.pct<0){d.pct=0;}
					if(d.pct>100){d.pct=100;}
				}
				else
				if( ctrack.convert_not_zero("spend",v) )
				{
					d.commitment=d.spend
					d.pct=100
				}

				a.push(d);
				s.push( plate.replace(args.plate || "{list_activities_data}",d) );
			}
			ctrack.chunk(args.chunk || "list_activities_datas",s.join(""));
			ctrack.chunk("total",data.rows.length);


			var cc=[];
			cc[0]=["iati-identifier","title","reporting-org","total-commitment","total-spend","currency","link","activity-status"];
			a.forEach(function(v){
				cc[cc.length]=[decodeURIComponent(v.aid),v.title,v.reporting,v.commitment,v.spend,v.currency,ctrack.origin+"/ctrack.html#view=act&aid="+v.aid,v.status_code];
			});
			ctrack.chunk((args.chunk || "list_activities_datas")+"_csv","data:text/csv;charset=UTF-8,"+ctrack.encodeURIComponent(csvw.arrayToCSV(cc)));
			
		}
		if(args.callback){args.callback(data);}
		ctrack.display();
	});
}
