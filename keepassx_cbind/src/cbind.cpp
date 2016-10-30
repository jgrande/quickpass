// Copyright (c) 2014, 2016 Juan Grande
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
// 
//     (1) Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer. 
// 
//     (2) Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in
//     the documentation and/or other materials provided with the
//     distribution.  
//     
//     (3)The name of the author may not be used to
//     endorse or promote products derived from this software without
//     specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
// IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

#include "cbind.h"

#include <iostream>

#include <getopt.h>

#include "autotype/WildcardMatcher.h"
#include "core/Database.h"
#include "core/Entry.h"
#include "core/Group.h"
#include "crypto/Crypto.h"
#include "format/KeePass2Reader.h"
#include "keys/CompositeKey.h"
#include "keys/PasswordKey.h"

extern "C" void KeePassX_Init() {
	Crypto::init();
}

extern "C" void* KeePassX_Open(const char* dbFilename, const char* passphrase) {
		CompositeKey key;
		key.addKey(PasswordKey(passphrase));
		KeePass2Reader reader;
		Database* db = reader.readDatabase(dbFilename, key);
		if (!db) {
			std::cout << "db is null\n";
			return NULL;
		}
		return db;
}

extern "C" void KeePassX_FreeDb(void* dbptr) {
	delete (Database*) dbptr;
}

extern "C" void KeePassX_FreeEntry(void* voidptr) {
	const KeePassX_Entry* entryptr = (KeePassX_Entry*) voidptr;
	delete entryptr->title;
	delete entryptr->username;
	delete entryptr->password;
	delete entryptr;
}

extern "C" KeePassX_Entry* KeePassX_Search(void* dbptr, const char* url) {
	const Database* db = (const Database*) dbptr;
	const Group* root = db->rootGroup();

	if (!root) {
		return NULL;
	}

	QList<Entry*> entries = root->entriesRecursive();
	WildcardMatcher matcher(url);
	for (int i = 0; i < entries.size(); i++) {
		if (matcher.match(entries.at(i)->url()) && entries.at(i)->group()->name() != "Backup") {
			KeePassX_Entry* entry = new KeePassX_Entry;
			entry->title = qstrdup(qPrintable(entries.at(i)->title()));
			entry->username = qstrdup(qPrintable(entries.at(i)->username()));
			entry->password = qstrdup(qPrintable(entries.at(i)->password()));
			return entry;
		}
	}

	return NULL;
}
