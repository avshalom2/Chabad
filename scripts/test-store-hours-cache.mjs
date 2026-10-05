import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
let value={hours:'10:00-19:00'}, reads=0, entry, invalidation;
mock.module('next/cache.js',{namedExports:{
  unstable_cache(fn){return async()=>{if(entry===undefined)entry=await fn();return entry;};},
  revalidateTag(tag,options){invalidation={tag,options};entry=undefined;},
}});
mock.module('../src/lib/settings.js',{namedExports:{async getSetting(key){assert.equal(key,'store_hours');reads++;return value;}}});
const {getCachedStoreHours,invalidateStoreHours}=await import('../src/lib/store-hours-cache.js');
test('Store hours reuse cached settings; saving invalidates immediately',async()=>{
  assert.deepEqual(await getCachedStoreHours(),value);await getCachedStoreHours();assert.equal(reads,1);
  value={hours:'11:00-18:00'};invalidateStoreHours();assert.deepEqual(invalidation,{tag:'store-hours',options:{expire:0}});
  assert.deepEqual(await getCachedStoreHours(),value);assert.equal(reads,2);
});
test('Missing store setting supplies defaults without a second client request',async()=>{
  value=null;invalidateStoreHours();assert.deepEqual(await getCachedStoreHours(),{});
});
