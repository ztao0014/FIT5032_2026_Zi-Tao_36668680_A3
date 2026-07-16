<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  starSize: {
    type: String,
    default: '1.5rem',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const stars = [1, 2, 3, 4, 5]

const displayValue = computed(() => Math.round(props.modelValue * 2) / 2)

function setRating(star) {
  if (props.readonly || props.disabled) return
  emit('update:modelValue', star)
}

function starClass(star) {
  if (displayValue.value >= star) return 'star active'
  if (displayValue.value >= star - 0.5) return 'star active'
  return 'star'
}

function ariaLabel(star) {
  return star + ' star' + (star > 1 ? 's' : '')
}
</script>

<template>
  <div
    class="star-rating d-inline-flex align-items-center"
    role="radiogroup"
    :aria-label="readonly ? 'Rating: ' + modelValue + ' out of 5' : 'Rate this item'"
  >
    <button
      v-for="star in stars"
      :key="star"
      type="button"
      class="star border-0 bg-transparent p-0 me-1"
      :class="starClass(star)"
      :style="{ fontSize: starSize }"
      :disabled="readonly || disabled"
      :aria-label="ariaLabel(star)"
      :aria-checked="modelValue === star"
      role="radio"
      @click="setRating(star)"
    >
      ★
    </button>
    <span v-if="modelValue > 0" class="ms-2 fw-bold text-sb-gold">
      {{ modelValue }} / 5
    </span>
  </div>
</template>

<style scoped>
.star {
  cursor: pointer;
  color: #ccc;
  transition: color 0.15s ease;
}
.star.active {
  color: #f0a500;
}
.star:not(:disabled):hover {
  color: #ffc107;
}
.star:disabled {
  cursor: default;
}
</style>
