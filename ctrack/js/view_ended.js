// Copyright (c) 2014 International Aid Transparency Initiative (IATI)
// Licensed under the MIT license whose full text can be found at http://opensource.org/licenses/MIT


const view_ended={}
export default view_ended
view_ended.name="view_ended"

import ctrack  from "./ctrack.js"
import views   from "./views.js"
import fetcher from "./fetcher.js"


// the chunk names this view will fill with new data
view_ended.chunks=[
	"ended_projects_datas",
	"ended_projects",
];

//
// Perform ajax call to get data
//
view_ended.ajax=function(args)
{	
	var today=fetcher.get_today();
	
	args=args || {};
	
	args.q=args.q || {};
	args.q.day_end_lt = today;
	args.q.day_length_not_null = 1;
	args.q.orderby="day_end-";

	if(args.output=="count") // just count please
	{
		args.chunk = args.chunk || "ended_projects";
	}
	else
	{
		args.plate = args.plate || "{ended_projects_data}";
		args.chunk = args.chunk || "ended_projects_datas";
	}
	
	views.list_activities.ajax(args);
}
//
// Perform ajax call to get numof data
//
view_ended.view=function(args)
{
	view_ended.chunks.forEach(function(n){ctrack.chunk(n,"{spinner}");});

	ctrack.setcrumb(1);
	ctrack.change_hash();

	view_ended.ajax({output:"count"});
	view_ended.ajax({limit:-1});
}

