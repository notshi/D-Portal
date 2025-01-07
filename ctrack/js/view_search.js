// Copyright (c) 2014 International Aid Transparency Initiative (IATI)
// Licensed under the MIT license whose full text can be found at http://opensource.org/licenses/MIT


var view_search=exports;
exports.name="view_search";

var ctrack=require("./ctrack.js")
var plate=require("./plate.js")
var iati=require("./iati.js")
var fetcher=require("./fetcher.js")

var views=require("./views.js")

var iati_codes=require("../../dstore/json/iati_codes.json")

var dflat_codes=require("../../dflat/json/codelists.json")

var commafy=function(s) { return (""+s).replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
		return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,"); }) };

// valid years for drop downs
var text_years={} ; for(var i=1960;i<2030;i++) { text_years[i]=i+"" }
var text_years_date={} ; for(var i=1960;i<2030;i++) { text_years_date[i]=i }
var text_policy={}
for(var sn in iati_codes.policy_sig) // policy needs two codes to be joined
{
	var sv=iati_codes.policy_sig[sn];
	for(var cn in iati_codes.policy_code)
	{
		var cv=iati_codes.policy_code[cn];
		var n=sn+"_"+cn
		var v=cv+" ("+sv+")"
		var valid=true

		if( sn==3 )
		{
			if( cn!=8 )
			{
				valid=false
			}
		}

		if( sn==4 )
		{
			if( cn!=9 )
			{
				valid=false
			}
		}

		if(valid)
		{
			text_policy[n]=v
		}
	}
}
var text_bool={"0":"No",1:"Yes"}
var text_hierarchy={1:"1",
					2:"2",
					3:"3",
					4:"4"}
var text_powers={1:"1 USD",
				 10:"10 USD",
				 100:"100 USD",
				 1000:"1 Thousand USD",
				 10000:"10 Thousand USD",
				 100000:"100 Thousand USD",
				 1000000:"1 Million USD",
				 10000000:"10 Million USD",
				 100000000:"100 Million USD",
				 1000000000:"1 Billion USD",
				 10000000000:"10 Billion USD"}



// try and make the search code more generic and data driven

view_search.terms=[

{
	name   : "search",
	search : false,
	filter : true,
	codes  : null,
	inputs : [ "#view_search_string" , "#view_search_string_only" ],
	q      : "text_search",
	show   : "search_display_search",
},

{
	name   : "country",
	search : true,
	filter : true,
	codes  : [ iati_codes.country, ],
	drops  : [ "#view_search_select_country" ],
	q      : "country_code",
	list   : "search_options_country",
	show   : "search_display_country",
},

{
	name   : "sector_group",
	search : true,
	filter : true,
	codes  : [ iati_codes.sector_category, ],
	drops  : [ "#view_search_select_category" ],
	q      : "sector_group",
	list   : "search_options_sector_group",
	show   : "search_display_sector_group",
},

{
	name   : "status",
	search : true,
	filter : true,
	codes  : [ iati_codes.activity_status, ],
	drops  : [ "#view_search_select_status" , ],
	q      : "status_code",
	list   : "search_options_status",
	show   : "search_display_status",
},

{
	name   : "publisher",
	search : true,
	filter : true,
	codes  : [ iati_codes.publisher_names, ],
	drops  : [ "#view_search_select_publisher" ],
	q      : "reporting_ref",
	list   : "search_options_publisher",
	show   : "search_display_publisher",
},

{
	name   : "sector",
	search : true,
	filter : true,
	codes  : [ iati_codes.sector , iati_codes.sector_withdrawn ],
	drops  : [ "#view_search_select_sector" ],
	q      : "sector_code",
	list   : "search_options_sector",
	show   : "search_display_sector",
},

{
	name   : "year",
	search : true,
	codes  : [ text_years, ],
	list   : "search_options_year",
},

{
	name   : "year_min",
	filter : true,
	codes  : [ text_years_date, ],
	drops  : [ "#view_search_select_year_min" ],
	q      : "year_min",
	show   : "search_display_year_min",
},

{
	name   : "year_max",
	filter : true,
	codes  : [ text_years_date, ],
	drops  : [ "#view_search_select_year_max" ],
	q      : "year_max",
	show   : "search_display_year_max",
},

{
	name   : "participating",
	search : false,
	filter : true,
	codes  : [ iati_codes.publisher_names, ],
	drops  : [ "#view_search_select_participating" ],
	q      : "/participating-org@ref",
	list   : "search_options_participating",
	show   : "search_display_participating",
	more   : true,
},

{
	name   : "policy",
	search : true,
	filter : true,
	codes  : [ text_policy, ],
	drops  : [ "#view_search_select_policy" , ],
	q      : "policy_code",
	list   : "search_options_policy",
	show   : "search_display_policy",
	more   : true,
},

{
	name   : "tag_vocab",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["TagVocabulary"], ],
	drops  : [ "#view_search_select_tag_vocab" ],
	q      : "/tag@vocabulary",
	list   : "search_options_tag_vocab",
	show   : "search_display_tag_vocab",
	more   : true,
	sort   : "value",
},

{
	name   : "humanitarian_scope",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["HumanitarianScopeVocabulary"], ],
	drops  : [ "#view_search_select_humanitarian_scope" ],
	q      : "/humanitarian-scope@vocabulary",
	list   : "search_options_humanitarian_scope",
	show   : "search_display_humanitarian_scope",
	more   : true,
},

{
	name   : "humanitarian_activity",
	search : false,
	filter : true,
	codes  : [ text_bool, ],
	drops  : [ "#view_search_select_humanitarian_activity" ],
	q      : "*@humanitarian",
	list   : "search_options_humanitarian_activity",
	show   : "search_display_humanitarian_activity",
	more   : true,
	hidecode : true,
},

{
	name   : "sector_vocabulary",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["SectorVocabulary"], ],
	drops  : [ "#view_search_select_sector_vocabulary" ],
	q      : "*/sector@vocabulary",
	list   : "search_options_sector_vocabulary",
	show   : "search_display_sector_vocabulary",
	more   : true,
	sort   : "value",
},

{
	name   : "hierarchy",
	search : false,
	filter : true,
	codes  : [ text_hierarchy, ],
	drops  : [ "#view_search_select_hierarchy" ],
	q      : "*@hierarchy",
	list   : "search_options_hierarchy",
	show   : "search_display_hierarchy",
	more   : true,
	hidecode : true,
},

{
	name   : "commitment_min",
	search : false,
	filter : true,
	codes  : [ text_powers, ],
	drops  : [ "#view_search_select_commitment_min" ],
	q      : "commitment_gteq",
	list   : "search_options_commitment_min",
	show   : "search_display_commitment_min",
	more   : true,
	hidecode : true,
	sort   : "value",
},

{
	name   : "commitment_max",
	search : false,
	filter : true,
	codes  : [ text_powers, ],
	drops  : [ "#view_search_select_commitment_max" ],
	q      : "commitment_lteq",
	list   : "search_options_commitment_max",
	show   : "search_display_commitment_max",
	more   : true,
	hidecode : true,
	sort   : "value",
},

{
	name   : "result_type",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["ResultType"], ],
	drops  : [ "#view_search_select_result_type" ],
	q      : "/result@type",
	list   : "search_options_result_type",
	show   : "search_display_result_type",
	more   : true,
},

{
	name   : "document_category",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["DocumentCategory"], ],
	drops  : [ "#view_search_select_document_category" ],
	q      : "*/document-link/category@code",
	list   : "search_options_document_category",
	show   : "search_display_document_category",
	more   : true,
},

{
	name   : "transaction_type",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["TransactionType"], ],
	drops  : [ "#view_search_select_transaction_type" ],
	q      : "/transaction/transaction-type@code",
	list   : "search_options_transaction_type",
	show   : "search_display_transaction_type",
	more   : true,
},

{
	name   : "finance_type",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["FinanceType"], ],
	drops  : [ "#view_search_select_finance_type" ],
	q      : "/default-finance-type@code",
	list   : "search_options_finance_type",
	show   : "search_display_finance_type",
	more   : true,
},

{
	name   : "flow_type",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["FlowType"], ],
	drops  : [ "#view_search_select_flow_type" ],
	q      : "/default-flow-type@code",
	list   : "search_options_flow_type",
	show   : "search_display_flow_type",
	more   : true,
},

{
	name   : "collaboration_type",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["CollaborationType"], ],
	drops  : [ "#view_search_select_collaboration_type" ],
	q      : "/collaboration-type@code",
	list   : "search_options_collaboration_type",
	show   : "search_display_collaboration_type",
	more   : true,
},

{
	name   : "aid_type",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["AidType"], ],
	drops  : [ "#view_search_select_aid_type" ],
	q      : "/default-aid-type@code",
	list   : "search_options_aid_type",
	show   : "search_display_aid_type",
	more   : true,
},

{
	name   : "tied_status",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["TiedStatus"], ],
	drops  : [ "#view_search_select_tied_status" ],
	q      : "/default-tied-status@code",
	list   : "search_options_tied_status",
	show   : "search_display_tied_status",
	more   : true,
},

{
	name   : "related_activity",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["RelatedActivityType"], ],
	drops  : [ "#view_search_select_related_activity" ],
	q      : "/related-activity@type",
	list   : "search_options_related_activity",
	show   : "search_display_related_activity",
	more   : true,
},

{
	name   : "reporting_organisation_type",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["OrganisationType"], ],
	drops  : [ "#view_search_select_reporting_organisation_type" ],
	q      : "/reporting-org@type",
	list   : "search_options_reporting_organisation_type",
	show   : "search_display_reporting_organisation_type",
	more   : true,
},

{
	name   : "region",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["Region"], ],
	drops  : [ "#view_search_select_region" ],
	q      : "/recipient-region@code",
	list   : "search_options_region",
	show   : "search_display_region",
	more   : true,
},

{
	name   : "budget_type",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["BudgetType"], ],
	drops  : [ "#view_search_select_budget_type" ],
	q      : "/budget@type",
	list   : "search_options_budget_type",
	show   : "search_display_budget_type",
	more   : true,
},

{
	name   : "planned_disbursement_type",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["BudgetType"], ],
	drops  : [ "#view_search_select_planned_disbursement_type" ],
	q      : "/planned-disbursement@type",
	list   : "search_options_planned_disbursement_type",
	show   : "search_display_planned_disbursement_type",
	more   : true,
},

{
	name   : "activity_scope",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["ActivityScope"], ],
	drops  : [ "#view_search_select_activity_scope" ],
	q      : "/activity-scope@code",
	list   : "search_options_activity_scope",
	show   : "search_display_activity_scope",
	more   : true,
},

{
	name   : "aids",
	search : false,
	filter : true,
	codes  : null,
	inputs : [ "#view_search_input_aids" ],
	q      : "aids",
	show   : "search_display_aids",
	more   : true,
},

{
	name   : "keyword",
	search : false,
	filter : true,
	codes  : null,
	inputs : [ "#view_search_input_keyword" ],
	q      : "keyword",
	show   : "search_display_keyword",
	more   : true,
},

{
	name   : "tag_unsdg",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["UNSDG-Goals"], ],
	drops  : [ "#view_search_select_tag_unsdg" ],
	q      : "tag_unsdg",
	list   : "search_options_tag_unsdg",
	show   : "search_display_tag_unsdg",
	more   : true,
	sort   : "value",
	icon   : "/ctrack/art/sdg/sdg-{num}.svg",
},
{
	name   : "tag_unsdt",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["UNSDG-Targets"], ],
	drops  : [ "#view_search_select_tag_unsdt" ],
	q      : "tag_unsdt",
	list   : "search_options_tag_unsdt",
	show   : "search_display_tag_unsdt",
	more   : true,
	sort   : "value",
	icon   : "/ctrack/art/sdg/sdg-{num}.svg",
},
{
	name   : "tag_unsdi",
	search : false,
	filter : true,
	codes  : [ dflat_codes["en-name"]["UNSDG-Indicators"], ],
	drops  : [ "#view_search_select_tag_unsdi" ],
	q      : "tag_unsdi",
	list   : "search_options_tag_unsdi",
	show   : "search_display_tag_unsdi",
	more   : true,
	sort   : "value",
	icon   : "/ctrack/art/sdg/sdg-{num}.svg",
},

]

// the chunk names this view will fill with new data
view_search.chunks=[
//	"table_active_datas",
//	"table_ended_datas",
];


var split_or=function(s)
{
	var a=s.split(",")
	if(a.length>1) { return a }
	return s.split("|")
}

// called on view display to fix html in place
view_search.fixup=function()
{
//	views.map.fixup();


	var lookup={};
	var strings=[];

	for( var idx in view_search.terms )
	{
		var it=view_search.terms[idx]
		if(it.search) // perform substring match in search box
		{
			for(var codes of it.codes)
			{
				for(var n in codes)
				{
					var v=codes[n];
					var s=v+" ("+n+")";
					if(it.hidecode) s=v // hide the code
					if(v)
					{
						strings.push(s);
						lookup[s]={group:it.name,value:n,text:v,str:s};
					}
				}
			}
		}
	}



	var substringMatcher = function() {
	  return function findMatches(q, cb) {
		var matches, substringRegex;

		// an array that will be populated with substring matches
		matches = [];

		var words=q.split(/(\s+)/);

		var ups={}

		for(var i in words)
		{
			var word=words[i];

			if((word!="")&&(!word.match(/\s/))) // ignore blank/spaces
			{
//console.log("searchin:"+word);
				substrRegex = new RegExp(word, 'i');

				// iterate through the pool of strings and for any string that
				// contains the substring `q`, add it to the `matches` array
				$.each(strings, function(i, str) {
				  if (substrRegex.test(str)) {
					if(lookup[str]) // sanity test
					{
						ups[str]=(ups[str]||0)+1;
//						matches.push( lookup[str] );
		//				console.log(lookup[str]);
					}
				  }
				});
			}
		}
//		console.log(ups)
		for(var n in ups)
		{
			matches.push( lookup[n] );
		}
		matches.sort(function(a,b){
			var la=ups[a.str];
			var lb=ups[b.str];
			if(la==lb){ // sort by text
				var aa=a.text.toLowerCase().replace("the ", "");
				var bb=b.text.toLowerCase().replace("the ", "");
				return ((aa > bb) - (bb > aa));
			}
			else if(la<lb) { return 1; } else { return -1; } // sort by number of dupes
		});

		cb(matches);
	  };
	};

	var typeaheadref=$('#view_search_string').typeahead({
	  hint: false,
	  highlight: true,
	  minLength: 1
	},
	{
		name: 'ctrack',
		display: function(a){return a.str;},
		limit:65536,
		source: substringMatcher(),
		templates: {
			suggestion: function(a)
			{
				return "<div><img src=\""+ctrack.args.art+"label_"+a.group+".png\"></img> "+a.str+"</div>";
			}
		}
  	});


	var build_query=function(e){

		var que=[];
		var q={};
		var enable_search=false;

		for( var idx in view_search.terms )
		{
			var it=view_search.terms[idx]
			if(it.filter)
			{
				var v=undefined
				for(let drop of (it.inputs||it.drops||[]) )
				{
					if(!v)
					{
						v=$(drop).val()
					}
				}
				if(v) { v=(v+"").trim(); }
				if(v)
				{
					enable_search=true
					que.push(it.q+"="+ctrack.encodeURIComponent(v))
					ctrack.hash[it.q]=v
					q[it.q]=v
				}
				else
				{
					delete ctrack.hash[it.q]
				}
			}
		}

		if(enable_search)
		{
			$("#search_link").attr("href","?"+que.join("&")+"#view=main");
		}
		else
		{
			$("#search_link").removeAttr("href");
		}
		view_search.ajax({q:q});

		ctrack.display_hash(); // display current search settings in hash string so we can bookmark

		return "?"+que.join("&")+"#view=main";
	}


	var search_select_ids={}
	var search_select_sort_ids={}
	for( var idx in view_search.terms )
	{
		var it=view_search.terms[idx]
		if(it.filter)
		{
			for( let drop of (it.drops||[]) ) // (skips search)
			{
				search_select_ids[drop]=true
				search_select_sort_ids[drop]=true
			}
		}
	}

// check for external json url
	$('#view_search_input_aids').bind("change",function(e){
		build_query();
	});

	$('#view_search_input_keyword').bind("change",function(e){
		build_query();
	});

	var o={allow_single_deselect:true,search_contains:true,placeholder_text:"Select an option",placeholder_text_multiple:"Select one or multiple options"};
	for(var n in search_select_ids)
	{
		$(n).chosen(o).change(build_query);
	}

	var apply=function(v){
		if(v)
		{
//			console.log(v);
			var aa=[v.group];
			if(v.group=="year") { aa=["year_min","year_max"]; }
			for(var i=0;i<aa.length;i++)
			{
				var hash="#view_search_select_"+aa[i];
				$(hash).parent().show();
				$(hash).val(v.value).trigger("chosen:updated");
				var s=$('#view_search_string').val();
				s=s.replace(v.str,"");
				$('#view_search_string').typeahead('val', s);
			}
		}
	};

	$('#view_search_string').bind('typeahead:select', function(ev, a) {
		apply(a);
		build_query();
	});

	$('#view_search_string').bind('typeahead:autocomplete', function(ev, a) {
		apply(a);
		build_query();
	});

	$('#view_search_string').bind('change', function(ev, a) {
		build_query();
	});

	var sort_chosen_by="ABC";
	var sort_chosen=function(sel)
	{

		var selected = sel.val() || ""; // cache selected value, before reordering
		var opts_list = sel.find('option').filter(function() { return this.value || $.trim(this.value).length != 0; });
		opts_list.sort(
			function(a, b)
			{
				if(sort_chosen_by=="123")
				{
					var av=$(a).val().toUpperCase()
					var bv=$(b).val().toUpperCase()
					if( ( (Number(av)+"") == av ) && ( (Number(bv)+"") == bv ) )
					{
						av=Number(av)  //non destructive conversion to number
						bv=Number(bv)
					}
					return av > bv ? 1 : -1;
				}
				else
				{
					return $(a).text() > $(b).text() ? 1 : -1;
				}
			}
		);
		sel.html('').append(opts_list);
		sel.val(selected); // set cached selected value
	}

	$('#view_search_order').bind('click', function(e, a) {
			e.preventDefault();

			var a1=$('#view_search_order span.order_1, #view_search_order .toggle_abc');
			var a2=$('#view_search_order span.order_2, #view_search_order .toggle_123');

			if(sort_chosen_by=="ABC")
			{
				a1.show().hide();
				a2.hide().show();
				sort_chosen_by="123";
				ctrack.hash.sort="123";
				ctrack.display_hash();
			}
			else
			{
				a1.hide().show();
				a2.show().hide();
				sort_chosen_by="ABC";
				ctrack.hash.sort="ABC";
				ctrack.display_hash();
			}


			for(var n in search_select_sort_ids)
			{
				sort_chosen($(n));
				$(n).trigger('chosen:updated');
			}

		});

	$('#view_search_clear').bind('click', function(e, a) {
			e.preventDefault();
			for(var n in search_select_ids)
			{
				$(n+' option').prop('selected', false);
				$(n).trigger('chosen:updated');
			}
			build_query();
		});


// goto new url
	var change=function(){

		var name=""+$("#publisher_dropmenu select").val();
		if(name && (name!=""))
		{
			window.location.href=ctrack.chunk("ctrack_html")+"&publisher="+name
		}

		var name=""+$("#country_dropmenu select").val();
		if(name && (name!=""))
		{
			window.location.href=ctrack.chunk("ctrack_html")+"&country="+name
		}

	};

// enter key press on search2
	$('#view_search_string_only').bind("enterKey",function(e){
		window.location.href=build_query(e);
	});
	$('#view_search_string_only').keyup(function(e){
		if(e.keyCode == 13)
		{
			$(this).trigger("enterKey");
		}
	});

	if(	(sort_chosen_by=="ABC") && (ctrack.hash.sort=="123") )
	{
		$('#view_search_order').trigger("click");
	}

//	for(var n in ctrack.hash){console.log(n+" = "+ctrack.hash[n])}
// update the current selection to values found in the hash


// check if we need to display more filters
	var more=false
	for( var idx in view_search.terms )
	{
		var it=view_search.terms[idx]
		if(it.filter) // perform substring match in search box
		{
			var v=ctrack.hash[it.q]
			if(v)
			{
				more|=it.more
			}
		}
	}
	if(more)
	{
		$('#more_filters').show();
	}

	for( var idx in view_search.terms )
	{
		var it=view_search.terms[idx]
		if(it.filter) // perform substring match in search box
		{
			var v=ctrack.hash[it.q]
			if(v)
			{
				var vs=split_or(v)
				for(var drop of (it.drops||[]) )
				{
					$(drop).val(vs).trigger('chosen:updated')
				}
				for(var input of (it.inputs||[]) )
				{
					$(input).val(vs).trigger('chosen:updated')
				}
			}
		}
	}


// wait a little while otherwise above changes do not work...
	setTimeout(build_query,100)
// and wait even longer to set focus
	setTimeout(function(){
		$('#view_search_string').focus();
		$('#view_search_string_only').focus();
	},500)
}
//
// Perform ajax call to get numof data
//
view_search.view=function(args)
{

	if(ctrack.q.test)
	{
		ctrack.chunk("view_search_filters_test_maybe","{view_search_filters_test}")
	}

	views.search.chunks.forEach(function(n){ctrack.chunk(n,"{spinner}");});

	ctrack.setcrumb(0);
	ctrack.change_hash();


	var compare=function(a,b)
	{
		var aa=(a.split(">")[1]).split("<")[0];
		var bb=(b.split(">")[1]).split("<")[0];
		aa=aa.toLowerCase().replace("the ", "");
		bb=bb.toLowerCase().replace("the ", "");
		return ((aa > bb) - (bb > aa));
	};

	var compare_value=function(a,b)
	{
		var aa=(a.split("'")[1]).split("'")[0];
		var bb=(b.split("'")[1]).split("'")[0];
		aa=parseInt(aa);
		bb=parseInt(bb);
		return ((aa > bb) - (bb > aa));
	};


	for( var idx in view_search.terms )
	{
		var it=view_search.terms[idx]
		if(it.list && it.codes)
		{
			var a=[];
			for(var codes of it.codes)
			{
				for(var n in codes)
				{
					var v=codes[n]
					var s="<option value='"+n+"'>"+v+" ("+n+")</option>";
					if(it.hidecode) s="<option value='"+n+"'>"+v+"</option>" // hide the code
					a.push(s);
				}
			}
			if( it.sort=="value" )
			{
				a.sort(compare_value);
			}
			else
			{
				a.sort(compare);
			}
			ctrack.chunk(it.list,a.join(""));
		}
	}

	view_search.ajax();

}

view_search.latest=0;
view_search.ajax=function(args)
{
	if( ctrack.hash.aids ) // need to perform prefetch of this url
	{
		fetcher.prefetch_aids(ctrack.hash.aids,function(){
			view_search.ajax_fetch(args)
		})
	}
	else
	{
		fetcher.aids=undefined // removed any cached aids values

		view_search.ajax_fetch(args)
	}
}

view_search.ajax_fetch=function(args)
{
	var args=args || {};
	var dat={
			"from":"act",
			"limit":-1,
			"select":"count_aid",
		};
	fetcher.ajax_dat_fix(dat,args);

	if(dat.year_max)
	{
		dat["day_start_lteq"]=(Number(dat.year_max)+1) + "-01-01"
	}
	if(dat.year_min)
	{
		dat["day_end_gt"]=(Number(dat.year_min)) + "-01-01"
	}

	$("#search_link").addClass("search_link_disable");
	$("#result_span").html("");
	$("#result_aid_link").html("");
	$("#result_aid_div").addClass("search_aid_link_disable");

	view_search.latest++;

	var count=0; for(var n in args.q) { count++; }
	if(count==0)
	{
		return;
	}

	$("#result_span").html("Searching ...");

	var latest=view_search.latest;

	fetcher.ajax(dat,function(data){
		if(latest!=view_search.latest) { return; } // ignore old search data

		var c=0
		if( data && data.rows && data.rows[0] )
		{
			c=data.rows[0]["count_aid"];
			if( c>0 ) // show results
			{
				$("#search_link").removeClass("search_link_disable");
			}
		}
//console.log( data.rows[0] );
		$("#result_span").html("Found "+commafy(c)+" activities");
	});

	if( args && args.q && args.q.text_search ) // try for exact aid
	{
		fetcher.ajax({
				"from":"act",
				"limit":1,
				"aid":args.q.text_search.trim(),
			},function(data){
			if(latest!=view_search.latest) { return; } // ignore old search data

			if( data.rows.length>0 ) // show results
			{
//console.log( data );
				var aid=data.rows[0].aid
//				$("#result_aid_link").html("<a href=\"#view=act&aid="+aid+"\">View the activity with this IATI Identifier</a>");
//				$("#result_aid_div").removeClass("search_aid_link_disable");
				ctrack.change_hash({view:"act",aid:aid});
			}
		});
	}


}
