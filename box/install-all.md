When setting up a real server its safer to run things by hand and check 
that nothing went wrong as we go along.

Some of the install scripts can still be used but this list of actions 
should be used rather than just expecting install-all.sh to work.

I cut and paste from this file to the console one line at a time 
watching for problems.

Obviously step one is update apt and make sure a few tools are 
installed. Root commands are prefixed with sudo which should work if we 
are already root or if we are just a user who can sudo.

	sudo apt update
	sudo apt upgrade
	sudo apt install -y build-essential byobu pv curl parallel nano
	byobu-enable
	sudo echo "dportal" >/etc/hostname
	sudo reboot

The reboot to install new kernel (probably) and change hostname. When 
we log back in we should be running byobu.

Add a ctrack user that can sudo without a password but can not login, 
from this point on we can su - ctrack to switch from root to our new 
ctrack user.

	sudo useradd -m -s /usr/bin/bash ctrack
	sudo echo "ctrack ALL=(ALL) NOPASSWD:ALL" >/etc/sudoers.d/ctrack
	sudo su - ctrack

From now on we are expected to be the ctrack user.

Create some ssh keys.

	ssh-keygen -q -N "" </dev/zero
	cat ~/.ssh/id_rsa.pub

Will need to paste that generated key into github so we can talk ssh to 
them. https://github.com/settings/ssh/new

Set some git global defaults and checkout dportal from git.

	git config --global core.editor nano
	git config --global user.name kriss
	git config --global user.email kriss@xixs.com
	git clone git@github.com:IATI/D-Portal.git dportal
	cd dportal

Create a /dportal that links to this dportal directory.

	sudo ln -s `readlink -f .` /dportal

Setup local options.

	cp box/env.sh box/env.local.sh
	nano env.local.sh

Edit this file so it only contains the exports at the top and tweak 
values as required. IE change PGUSER to ctrack set a random password in 
PGPASS and delete all the bash commands below the exports.

Add these env values to our bash login so we can use them from the 
console. Then logout and log back in so it is applied.

	echo "source ~/dportal/box/env.sh" >>~/.bashrc
	exit
	su - ctrack
	cd dportal

Now we can use the install scripts. Keep a close eye on these to make 
sure they actually work.

	box/install-node.sh
	box/install-postgres.sh
	box/install-nginx.sh
	box/install-dportal.sh

Finally we can import some data into dportal.

	cd ~
	git clone git@github.com:xriss/dataiati.git
	cd dataiati
	./datasets.sh
	mkdir -p /dportal/dstore/cache
	cp datasets/*.xml /dportal/dstore/cache/
	cd /dportal
	box/cron-swap-import

And in another screen ( F2 and su - ctrack to login ) to watch the 
import progress.

	tail -f /dportal/logs/cron.import.log
	
This will take some time. At this point we are up and running the only 
thing left is to add some cronjobs to run things nightly. Make sure old 
dportal is not running these as they will both try and update the same 
git repos and probably clash.

	crontab -e

And add the following line.

	10 0 * * * /bin/bash -c "/dportal/box/cron"

Now we wait for the night and see what happens next...





