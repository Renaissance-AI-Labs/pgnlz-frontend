<template>
  <div class="admin-page">
    <div class="page-content">
      <div class="header-section">
        <h2 class="page-title">PGNLZ 管理后台</h2>
        <p class="page-intro">查询和浏览用户总业绩</p>
      </div>

      <div v-if="!walletState.isConnected" class="state-card">
        请先连接钱包后访问该页面。
      </div>
      <div v-else-if="!isWhitelisted" class="state-card error">
        当前地址无权限访问管理后台。
      </div>
      <div v-else class="content-section">
        <div class="panel search-panel">
          <h3 class="panel-title">按地址查询</h3>
          <div class="search-row">
            <input
              v-model.trim="searchAddress"
              class="address-input"
              type="text"
              placeholder="请输入钱包地址（0x...）"
              @keyup.enter="onSearchUser"
            />
            <button class="action-btn" :disabled="searchLoading || !searchAddress" @click="onSearchUser">
              {{ searchLoading ? '查询中...' : '查询' }}
            </button>
          </div>

          <div v-if="searchError" class="hint error">{{ searchError }}</div>
          <div v-if="searched && !searchResult" class="hint">该地址未查询到用户数据。</div>

          <div v-if="searchResult" class="result-card">
            <div class="search-result-item">
              <div class="label">地址</div>
              <div class="value mono value-address">{{ searchResult.id }}</div>
            </div>
            <div class="search-result-item">
              <div class="label">总业绩</div>
              <div class="value value-performance">{{ formatDisplayStake(searchResult.totalUmbrellaActiveStake) }}</div>
            </div>
          </div>
        </div>

        <div class="panel list-panel">
          <div class="list-header">
            <h3 class="panel-title">用户列表（按总业绩倒序）</h3>
            <div class="page-controls">
              <button class="action-btn small" :disabled="listLoading || currentPage <= 1" @click="goPrevPage">
                上一页
              </button>
              <span class="page-label">第 {{ currentPage }} / {{ maxPage }} 页</span>
              <button class="action-btn small" :disabled="listLoading || currentPage >= maxPage" @click="goNextPage">
                下一页
              </button>
            </div>
          </div>

          <div class="hint">
            每页 {{ pageSize }} 条，当前 skip: {{ currentSkip }}。基于 skip 的分页最多展示前 {{ maxPage }} 页。
          </div>
          <div v-if="listError" class="hint error">{{ listError }}</div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>用户信息</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="listLoading">
                  <td colspan="2" class="empty-cell">正在加载用户数据...</td>
                </tr>
                <tr v-else-if="users.length === 0">
                  <td colspan="2" class="empty-cell">暂无数据。</td>
                </tr>
                <tr v-else v-for="(user, idx) in users" :key="user.id">
                  <td>{{ currentSkip + idx + 1 }}</td>
                  <td>
                    <div class="user-cell">
                      <div class="mono user-address">{{ user.id }}</div>
                      <div class="user-performance">总业绩：{{ formatDisplayStake(user.totalUmbrellaActiveStake) }}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { ethers } from 'ethers';
import { walletState } from '@/services/wallet';
import {
  ADMIN_PERFORMANCE_ALLOWED_ADDRESSES,
  UMBRELLA_GRAPH_BEARER_TOKEN,
  UMBRELLA_GRAPH_ENDPOINT
} from '@/services/environment';

const pageSize = 1000;
const maxPage = 6;

const currentPage = ref(1);
const users = ref([]);
const listLoading = ref(false);
const listError = ref('');

const searchAddress = ref('');
const searchLoading = ref(false);
const searchError = ref('');
const searchResult = ref(null);
const searched = ref(false);

const isWhitelisted = computed(() => {
  if (!walletState.address) return false;
  return ADMIN_PERFORMANCE_ALLOWED_ADDRESSES.includes(walletState.address.toLowerCase());
});

const currentSkip = computed(() => (currentPage.value - 1) * pageSize);

const normalizeAddress = (value) => (value || '').trim().toLowerCase();

const formatDisplayStake = (rawValue) => {
  try {
    return Number(ethers.formatUnits(rawValue || '0', 18)).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  } catch (error) {
    return rawValue || '0';
  }
};

const postGraphQuery = async (query, variables = {}) => {
  const response = await fetch(UMBRELLA_GRAPH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${UMBRELLA_GRAPH_BEARER_TOKEN}`
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.errors?.[0]?.message || 'Graph 请求失败。');
  }
  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message || 'Graph 查询返回错误。');
  }

  return payload.data;
};

const fetchUsersList = async () => {
  listLoading.value = true;
  listError.value = '';

  const query = `
    query GetUsersList($first: Int!, $skip: Int!) {
      users(
        first: $first
        skip: $skip
        orderBy: totalUmbrellaActiveStake
        orderDirection: desc
      ) {
        id
        totalUmbrellaActiveStake
      }
    }
  `;

  try {
    const data = await postGraphQuery(query, {
      first: pageSize,
      skip: currentSkip.value
    });
    users.value = data?.users || [];
  } catch (error) {
    users.value = [];
    listError.value = error?.message || '获取用户列表失败。';
  } finally {
    listLoading.value = false;
  }
};

const onSearchUser = async () => {
  searchError.value = '';
  searched.value = false;
  searchResult.value = null;

  const normalized = normalizeAddress(searchAddress.value);
  if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
    searchError.value = '地址格式不正确。';
    return;
  }

  searchLoading.value = true;

  const query = `
    query GetSpecificUser($id: ID!) {
      user(id: $id) {
        id
        totalUmbrellaActiveStake
      }
    }
  `;

  try {
    const data = await postGraphQuery(query, { id: normalized });
    searchResult.value = data?.user || null;
    searched.value = true;
  } catch (error) {
    searchError.value = error?.message || '查询用户失败。';
  } finally {
    searchLoading.value = false;
  }
};

const goPrevPage = () => {
  if (currentPage.value <= 1) return;
  currentPage.value -= 1;
};

const goNextPage = () => {
  if (currentPage.value >= maxPage) return;
  currentPage.value += 1;
};

watch(currentPage, () => {
  if (walletState.isConnected && isWhitelisted.value) {
    fetchUsersList();
  }
});

watch(
  () => walletState.address,
  () => {
    currentPage.value = 1;
    users.value = [];
    listError.value = '';
    if (walletState.isConnected && isWhitelisted.value) {
      fetchUsersList();
    }
  }
);

onMounted(() => {
  if (walletState.isConnected && isWhitelisted.value) {
    fetchUsersList();
  }
});
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 1.5rem;
  color: var(--text-primary);
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header-section {
  margin-bottom: 0.5rem;
}

.page-title {
  font-size: 1.6rem;
  margin: 0;
}

.page-intro {
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
}

.state-card,
.panel {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
}

.state-card.error,
.hint.error {
  color: #fda4af;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-title {
  margin: 0 0 0.8rem;
  font-size: 1.05rem;
}

.search-row {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.address-input {
  flex: 1;
  min-width: 260px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  padding: 0.55rem 0.7rem;
}

.action-btn {
  background: var(--primary);
  border: none;
  border-radius: 8px;
  color: #fff;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
}

.action-btn.small {
  padding: 0.4rem 0.8rem;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint {
  margin-top: 0.55rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.result-card {
  margin-top: 0.7rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
}

.search-result-item + .search-result-item {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
}

.label {
  color: var(--text-secondary);
  font-size: 0.78rem;
  line-height: 1.2;
  margin-bottom: 0.2rem;
}

.value {
  text-align: left;
  white-space: normal;
  word-break: break-all;
  line-height: 1.3;
}

.value-address {
  max-width: 100%;
}

.value-performance {
  font-size: 0.95rem;
}

.mono {
  font-family: var(--font-code);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-label {
  font-size: 0.9rem;
}

.table-wrap {
  margin-top: 0.7rem;
  overflow-x: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  border-bottom: 1px solid var(--border);
  padding: 0.55rem;
  text-align: left;
  vertical-align: top;
  white-space: normal;
}

th {
  color: var(--text-secondary);
  font-weight: 600;
}

.empty-cell {
  text-align: center;
  color: var(--text-secondary);
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-address {
  word-break: break-all;
  line-height: 1.35;
}

.user-performance {
  color: var(--text-secondary);
  font-size: 0.84rem;
  line-height: 1.25;
}

</style>
