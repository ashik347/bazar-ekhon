import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';

const GEMINI_API_KEY = 'AIza5yD-pFoNwNRvPxZDAGP4c5M_QTBEz6RyI98';
const PRICE_DB = {
  "ঢাকা": { "ফার্মের মুরগি": { "কেজি": "180-190 টাকা" }, "দেশি মুরগি": { "কেজি": "550-600 টাকা" } },
  "চট্টগ্রাম": { "ফার্মের মুরগি": { "কেজি": "175-185 টাকা" }, "দেশি মুরগি": { "কেজি": "540-580 টাকা" } },
  "ময়মনসিংহ": { "ফার্মের মুরগি": { "কেজি": "170-180 টাকা" }, "দেশি মুরগি": { "কেজি": "520-560 টাকা" } }
};

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState('ঢাকা');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const getPrice = async (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
    setLoading(true);
    setAiResult('');
    const price = PRICE_DB[selectedDistrict]?.[product]?.['কেজি'] || 'তথ্য নেই';
    const prompt = `তুমি একজন বাঙালি বাজার বিশেষজ্ঞ। ${selectedDistrict} জেলায় আজকের ${product} এর বাজার দর ${price}। এই দাম নিয়ে 2 লাইনে মজার ডায়লগ দাও। দাম বাড়তি নাকি কমতি সেটাও বলো।`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      setAiResult(data.candidates[0].content.parts[0].text);
    } catch (error) {
      setAiResult('AI এর মাথা গরম হয়ে গেছে। একটু পর আবার ট্রাই করেন।');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>বাজার এখন 🔥</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.districtScroll}>
        {Object.keys(PRICE_DB).map(d => (
          <TouchableOpacity key={d} style={[styles.districtBtn, selectedDistrict === d && styles.districtBtnActive]} onPress={() => setSelectedDistrict(d)}>
            <Text style={[styles.districtText, selectedDistrict === d && styles.districtTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.subHeader}>{selectedDistrict} জেলার দাম</Text>
      {Object.keys(PRICE_DB[selectedDistrict]).map(product => (
        <TouchableOpacity key={product} style={styles.card} onPress={() => getPrice(product)}>
          <Text style={styles.productName}>{product}</Text>
          <Text style={styles.price}>{PRICE_DB[selectedDistrict][product]['কেজি']}</Text>
          <Text style={styles.tapText}>AI ডায়লগ দেখুন 👆</Text>
        </TouchableOpacity>
      ))}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{selectedProduct}</Text>
            <Text style={styles.modalPrice}>{PRICE_DB[selectedDistrict]?.[selectedProduct]?.['কেজি']}</Text>
            {loading? <ActivityIndicator size="large" color="#FF6B00" /> : <Text style={styles.aiText}>{aiResult}</Text>}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>বন্ধ করুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5E6', paddingTop: 50, paddingHorizontal: 15 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#FF6B00', textAlign: 'center', marginBottom: 20 },
  districtScroll: { maxHeight: 50, marginBottom: 15 },
  districtBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginRight: 10, borderWidth: 2, borderColor: '#FFD6B3' },
  districtBtnActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  districtText: { color: '#FF6B00', fontWeight: '600' },
  districtTextActive: { color: '#fff' },
  subHeader: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 3 },
  productName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 24, fontWeight: 'bold', color: '#00A651', marginVertical: 8 },
  tapText: { fontSize: 12, color: '#999' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', width: '85%', padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  modalPrice: { fontSize: 28, fontWeight: 'bold', color: '#00A651', textAlign: 'center', marginVertical: 15 },
  aiText: { fontSize: 16, lineHeight: 24, color: '#333', textAlign: 'center', marginVertical: 15 },
  closeBtn: { backgroundColor: '#FF6B00', padding: 15, borderRadius: 12, marginTop: 10 },
  closeBtnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }
});
