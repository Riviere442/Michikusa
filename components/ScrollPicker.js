import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export default function ScrollPicker({ items, selectedValue, onValueChange, unit }) {
  const flatListRef = useRef(null);
  const currentIndex = useRef(items.indexOf(selectedValue));

  useEffect(() => {
    const idx = items.indexOf(selectedValue);
    if (idx >= 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: idx * ITEM_HEIGHT, animated: false });
      }, 100);
    }
  }, []);

  const onMomentumEnd = useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    currentIndex.current = clamped;
    onValueChange(items[clamped]);
  }, [items, onValueChange]);

  const getItemLayout = useCallback((_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderItem = useCallback(({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item}</Text>
    </View>
  ), []);

  // 上下のパディング（中央に合わせるため）
  const padCount = Math.floor(VISIBLE_ITEMS / 2);

  const ListHeader = () => <View style={{ height: ITEM_HEIGHT * padCount }} />;
  const ListFooter = () => <View style={{ height: ITEM_HEIGHT * padCount }} />;

  return (
    <View style={styles.wrapper}>
      <View style={styles.pickerContainer}>
        <View style={styles.highlight} />
        <FlatList
          ref={flatListRef}
          data={items}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onMomentumEnd}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          style={{ height: PICKER_HEIGHT }}
          nestedScrollEnabled={true}
        />
      </View>
      {unit ? <Text style={styles.unit}>{unit}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pickerContainer: { width: 120, height: PICKER_HEIGHT, overflow: 'hidden', position: 'relative' },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    zIndex: 1,
    pointerEvents: 'none',
  },
  item: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  itemText: { fontSize: 20, color: '#333' },
  itemTextEmpty: { color: 'transparent' },
  unit: { fontSize: 18, color: '#333' },
});
