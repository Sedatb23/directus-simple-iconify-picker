<template>
  <div class="iconify-picker">
    <div class="selected-icon" @click="openPicker">
      <div v-if="selectedIcon" class="icon-preview">
        <img :src="getIconUrl(selectedIcon)" :alt="selectedIcon" />
        <span>{{ selectedIcon }}</span>
      </div>
      <div v-else class="placeholder">
        <v-icon name="add" />
        <span>Select an icon</span>
      </div>
    </div>

    <v-dialog v-model="pickerOpen" @esc="closePicker">
      <v-card class="picker-dialog">
        <v-card-title>Select Icon</v-card-title>
        
        <v-card-text>
          <!-- Collection Selector -->
          <div class="collection-selector">
            <v-select
              v-model="selectedCollection"
              :items="collectionOptions"
              item-text="name"
              item-value="prefix"
              placeholder="Select icon collection"
              @update:model-value="onCollectionChange"
            />
          </div>

          <!-- Search -->
          <div class="search-box">
            <v-input
              v-model="searchQuery"
              placeholder="Search icons..."
              @update:model-value="onSearchChange"
            >
              <template #prepend>
                <v-icon name="search" />
              </template>
            </v-input>
          </div>

          <!-- Search Mode Info -->
          <div v-if="isSearchingAllSets" class="search-info">
            <v-notice type="info">
              Searching across all icon sets. Results limited to 100 icons.
            </v-notice>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <v-notice type="danger">{{ error }}</v-notice>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading">
            <v-progress-circular indeterminate />
          </div>

          <!-- Icons Grid -->
          <div v-else-if="displayedIcons.length > 0" class="icons-grid">
            <div
              v-for="icon in displayedIcons"
              :key="icon"
              class="icon-item"
              :class="{ selected: selectedIcon === icon }"
              @click="selectIcon(icon)"
            >
              <img :src="getIconUrl(icon)" :alt="icon" />
              <span class="icon-name">{{ getIconDisplayName(icon) }}</span>
            </div>
          </div>

          <!-- No Results -->
          <div v-else class="no-results">
            <v-icon name="search_off" large />
            <p>No icons found</p>
          </div>

          <!-- Pagination -->
          <div v-if="totalIcons > iconsPerPage && !isSearchingAllSets" class="pagination">
            <v-button
              :disabled="currentPage === 1"
              @click="previousPage"
            >
              Previous
            </v-button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <v-button
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Next
            </v-button>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-button secondary @click="closePicker">Cancel</v-button>
          <v-button :disabled="!selectedIcon" @click="confirmSelection">Select</v-button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

interface Props {
  value: string | null;
  defaultCollection?: string;
  collections?: string[];
  iconSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  defaultCollection: 'mdi',
  collections: () => [],
  iconSize: 24,
});

const emit = defineEmits(['input']);

const pickerOpen = ref(false);
const selectedIcon = ref(props.value);
const selectedCollection = ref(props.defaultCollection);
const searchQuery = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const availableCollections = ref<any[]>([]);
const allIcons = ref<string[]>([]);
const filteredIcons = ref<string[]>([]);
const currentPage = ref(1);
const iconsPerPage = 50;
const isSearchingAllSets = ref(false);
const searchTimeout = ref<number | null>(null);

// Get the API base URL
const getApiUrl = () => {
  return `${window.location.origin}/iconify-proxy`;
};

// Add "All Sets" option to collection selector
const collectionOptions = computed(() => {
  return [
    { prefix: 'all', name: 'All Icon Sets' },
    ...availableCollections.value
  ];
});

const totalIcons = computed(() => filteredIcons.value.length);
const totalPages = computed(() => Math.ceil(totalIcons.value / iconsPerPage));

const displayedIcons = computed(() => {
  if (isSearchingAllSets.value) {
    // When searching all sets, show all results (already limited by API)
    return filteredIcons.value;
  }
  const start = (currentPage.value - 1) * iconsPerPage;
  const end = start + iconsPerPage;
  return filteredIcons.value.slice(start, end);
});

// Get display name for icon (show collection prefix when searching all sets)
const getIconDisplayName = (icon: string) => {
  const parts = icon.split(':');
  if (isSearchingAllSets.value && parts.length === 2) {
    return `${parts[1]}\n(${parts[0]})`;
  }
  return parts[1] || icon;
};

// Load available collections
const loadCollections = async () => {
  try {
    error.value = null;
    const response = await fetch(`${getApiUrl()}/collections`);
    
    if (!response.ok) {
      throw new Error(`Failed to load collections: ${response.statusText}`);
    }
    
    const data = await response.json();
    const collections = Object.entries(data).map(([key, value]: [string, any]) => ({
      prefix: key,
      name: value.name,
    }));

    if (props.collections && props.collections.length > 0) {
      availableCollections.value = collections.filter((c) =>
        props.collections.includes(c.prefix)
      );
    } else {
      availableCollections.value = collections;
    }
  } catch (err) {
    console.error('Failed to load collections:', err);
    error.value = 'Failed to load icon collections. Please try again.';
  }
};

// Load icons from selected collection
const loadIcons = async () => {
  if (!selectedCollection.value || selectedCollection.value === 'all') return;

  loading.value = true;
  error.value = null;
  isSearchingAllSets.value = false;
  
  try {
    const response = await fetch(
      `${getApiUrl()}/collection?prefix=${selectedCollection.value}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to load icons: ${response.statusText}`);
    }
    
    const data = await response.json();
    const icons = data.uncategorized || [];
    allIcons.value = icons.map((icon: string) => `${selectedCollection.value}:${icon}`);
    filteredIcons.value = allIcons.value;
    currentPage.value = 1;
  } catch (err) {
    console.error('Failed to load icons:', err);
    error.value = 'Failed to load icons. Please try again.';
    allIcons.value = [];
    filteredIcons.value = [];
  } finally {
    loading.value = false;
  }
};

// Search across all icon sets
const searchAllSets = async (query: string) => {
  if (!query || query.length < 2) {
    filteredIcons.value = [];
    return;
  }

  loading.value = true;
  error.value = null;
  isSearchingAllSets.value = true;
  
  try {
    const response = await fetch(
      `${getApiUrl()}/search?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search icons: ${response.statusText}`);
    }
    
    const data = await response.json();
    filteredIcons.value = data.icons || [];
    currentPage.value = 1;
  } catch (err) {
    console.error('Failed to search icons:', err);
    error.value = 'Failed to search icons. Please try again.';
    filteredIcons.value = [];
  } finally {
    loading.value = false;
  }
};

// Search icons in current collection
const searchInCollection = () => {
  if (!searchQuery.value) {
    filteredIcons.value = allIcons.value;
  } else {
    const query = searchQuery.value.toLowerCase();
    filteredIcons.value = allIcons.value.filter((icon) =>
      icon.toLowerCase().includes(query)
    );
  }
  currentPage.value = 1;
};

// Handle collection change
const onCollectionChange = () => {
  searchQuery.value = '';
  if (selectedCollection.value === 'all') {
    allIcons.value = [];
    filteredIcons.value = [];
    isSearchingAllSets.value = false;
  } else {
    loadIcons();
  }
};

// Handle search input with debouncing
const onSearchChange = () => {
  // Clear existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  // If searching all sets
  if (selectedCollection.value === 'all') {
    searchTimeout.value = window.setTimeout(() => {
      searchAllSets(searchQuery.value);
    }, 500); // 500ms debounce
  } else {
    // Search in current collection (no debounce needed)
    searchInCollection();
  }
};

// Get icon URL from proxy
const getIconUrl = (icon: string) => {
  const [collection, iconName] = icon.split(':');
  return `${getApiUrl()}/icon/${collection}/${iconName}?height=${props.iconSize}`;
};

const openPicker = () => {
  pickerOpen.value = true;
};

const closePicker = () => {
  pickerOpen.value = false;
  searchQuery.value = '';
  error.value = null;
  isSearchingAllSets.value = false;
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
};

const selectIcon = (icon: string) => {
  selectedIcon.value = icon;
};

const confirmSelection = () => {
  emit('input', selectedIcon.value);
  closePicker();
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Watch for value changes from parent
watch(() => props.value, (newValue) => {
  selectedIcon.value = newValue;
});

onMounted(() => {
  loadCollections();
  if (selectedCollection.value && selectedCollection.value !== 'all') {
    loadIcons();
  }
});
</script>

<style scoped>
.iconify-picker {
  width: 100%;
}

.selected-icon {
  border: 2px solid var(--border-normal);
  border-radius: var(--border-radius);
  padding: 12px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.selected-icon:hover {
  border-color: var(--primary);
}

.icon-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-preview img {
  width: 32px;
  height: 32px;
}

.placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--foreground-subdued);
}

.picker-dialog {
  --v-card-min-width: 600px;
  --v-card-max-width: 800px;
}

.collection-selector,
.search-box {
  margin-bottom: 16px;
}

.search-info,
.error-message {
  margin-bottom: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--foreground-subdued);
}

.no-results p {
  margin-top: 12px;
  font-size: 14px;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid var(--border-normal);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.icon-item:hover {
  border-color: var(--primary);
  background-color: var(--background-subdued);
}

.icon-item.selected {
  border-color: var(--primary);
  background-color: var(--primary-alt);
}

.icon-item img {
  width: 32px;
  height: 32px;
}

.icon-name {
  font-size: 10px;
  text-align: center;
  word-break: break-word;
  color: var(--foreground-subdued);
  white-space: pre-line;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-normal);
}
</style>
