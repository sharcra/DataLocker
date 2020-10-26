/* eslint-disable import/no-mutable-exports */

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import user from '@/store/user'
import DocumentStore from '@/store/document'
import collection from '@/store/collection'
import snackbar from '@/store/snackbar'
// import insertion point (do not change this text, it is being used by hygen cli)

let userStore: user
let documentStore: DocumentStore
let collectionStore: collection
let snackbarStore: snackbar
// variable insertion point (do not change this text, it is being used by hygen cli)

export default ({ store }: { store: Store<any> }) => {
  userStore = getModule(user, store)
  documentStore = getModule(DocumentStore, store)
  collectionStore = getModule(collection, store)
  snackbarStore = getModule(snackbar, store)
  // extractVuexModule insertion point (do not change this text, it is being used by hygen cli)
}

export {
  userStore,
  documentStore,
  collectionStore,
  snackbarStore,
  // export insertion point (do not change this text, it is being used by hygen cli)
}