<template>
  <div class="box-col h100">
    <!--搜索框 -->
    <div class="mod_search_bar">
      <back-link class="back"> </back-link>
      <search-box ref='sbox' :kw='keyWords' @search='search' @smartSearch='smartSearch' @status='searchStatus'></search-box>
      <div @click.stop='goSeach' id="cancel_btn" class="search_bar_tip_text" style="display: block;">取消</div>
    </div>
    <router-view v-if="!showHotKeys && !showSmart"></router-view>

    <div>
      <!-- 热门关子健 -->
      <hot-keys :hotkeys='hotkeys' v-if='showHotKeys' @selected='search'>
        <h3 class="result_tit">热门搜索</h3>
      </hot-keys>
      <!-- smart search 智能搜索结果 -->
      <smart-search-result :result='SSResult' v-if='showSmart'></smart-search-result>
    </div>

  </div>
</template>

<script>
  import HotKeys from '../components/Search/HotKeys'
  import SearchBox from '../components/Search/SearchBox'
  import SmartSearchResult from '../components/Search/SmartSearchResult'
  import BackLink from '../components/public/BackLink'
  import { mapState, mapMutations } from 'vuex'
  import Search from '../api/search'
  import Other from '../api/other'
  export default {
    components: {
      HotKeys,
      SearchBox,
      SmartSearchResult,
      BackLink
    },
    data() {
      return {
        ...mapState('searchHistory', {
          searchHistory: state => state.list
        }),
        hotkeys: [],
        // 显示热门关键字
        showHotKeys: true,
        // 展现智能搜索
        showSmart: false,
        // 智能搜素结果
        SSResult: null,
        // 关键字
        keyWords: null
      }
    },
    methods: {
      ...mapMutations('searchHistory', {
        addH: 'add',
        removeH: 'remove'
      }),
      // 搜索
      search(key) {
        this.addH(key)
        this.keyWords = key
        this.showSmart = false
        this.showHotKeys = false
        this.$router.replace({ name: 'SearchResultView', params: { keyWords: key } })
      },
      // 智能搜索
      async smartSearch(key) {
        this.showSmart = true
        if (!key || key.trim() === '') {
          this.SSResult = null
          return
        }
        let res = await Search.smartBox(key).then(res => res.json())
        if (res.data && res.data.song && res.data.song.itemlist.length > 0) {
          res.data.song.itemlist = res.data.song.itemlist.map(s => ({
            songname: s.name,
            songmid: s.mid,
            singer: s.singer
          }))
        }
        this.SSResult = res.data
      },
      // 更新当然搜索的状态
      searchStatus(status) {
        this.showHotKeys = !status
        this.showSmart = true
      },
      // 返回默认搜索页
      goSeach() {
        this.showHotKeys = true
        this.showSmart = false
        this.$refs.sbox.clear()
        this.$router.replace({ name: 'SearchView' })
      }
    },
    async mounted() {
      let res = await Other.hotkey().then(res => res.json())
      res.data.hotkey.unshift({ k: res.data.special_key })
      this.hotkeys = res.data.hotkey
    }
  }

</script>


<style scoped>
  .result_tit {
    color: rgba(0, 0, 0, .6);
    margin-bottom: 0.4rem;
    font-weight: 300;
    font-size: 1.1rem
  }

  .mod_search_bar {
    padding: 0.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    background-image: linear-gradient(270deg, #31c27c, #20bc22);
  }

  .mod_search_bar .search_bar_tip_text {
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    font-size: 0.8rem;
    height: 1.8rem;
    line-height: 1.8rem;
  }

  .back {
    width: 8%;
    display: flex;
    justify-content: center;
  }
</style>