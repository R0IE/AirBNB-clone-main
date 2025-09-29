<template>
  <div class="host-step-container">
    <h2>Name your house & add images</h2>
    <form @submit.prevent="submitHouseInfo">
      <div class="form-group">
        <label for="houseName">House Name</label>
        <input id="houseName" v-model="houseName" type="text" required placeholder="e.g. Cozy Cottage" />
      </div>
      <div class="form-group">
        <label for="houseImages">Images</label>
        <input id="houseImages" type="file" multiple accept="image/*" @change="handleImageUpload" />
        <div class="image-preview-list">
          <div v-for="(img, i) in imagePreviews" :key="i" class="image-preview-container">
            <img :src="img" class="image-preview" />
            <button type="button" @click="removeImage(i)" class="remove-image-btn">×</button>
          </div>
        </div>
      </div>
      <button class="host-next-btn" type="submit">Save & Continue</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../api.js';
const houseName = ref('');
const images = ref([]);
const imagePreviews = ref([]);
const router = useRouter();

function handleImageUpload(event) {
  const files = Array.from(event.target.files);
  
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      images.value.push(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviews.value.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
}

function removeImage(index) {
  images.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
}

async function submitHouseInfo() {
  try {
    const locationData = JSON.parse(localStorage.getItem('houseLocation') || '{}');
    const basicsData = JSON.parse(localStorage.getItem('houseBasics') || '{}');
    
    let imageUrls = [];
    
    if (images.value.length > 0) {
      console.log('Uploading', images.value.length, 'images...');
      const { data: uploadData, error: uploadError } = await supabase.uploadImages(images.value);
      
      if (uploadError) {
        console.error('Error uploading images:', uploadError);
        alert(`Failed to upload images: ${uploadError.message || 'Please try again.'}`);
        return;
      } else {
        console.log('Upload successful:', uploadData);
        imageUrls = uploadData.imageUrls;
      }
    }

    const houseData = {
      title: houseName.value,
      description: `A ${basicsData.bedrooms || 1} bedroom property`,
      location: locationData.address || 'Unknown location',
      price: 100,
      bedrooms: basicsData.bedrooms || 1,
      bathrooms: basicsData.bathrooms || 1,
      max_guests: basicsData.guests || 2,
      images: imageUrls,
      amenities: []
    };

    const { data, error } = await supabase.from('houses').insert(houseData);
    
    if (error) {
      console.error('Error creating house:', error);
      alert('Failed to create listing. Please try again.');
    } else {
      localStorage.removeItem('houseLocation');
      localStorage.removeItem('houseBasics');
      router.push('/house-added');
    }
  } catch (error) {
    console.error('Error submitting house info:', error);
    alert('Failed to create listing. Please try again.');
  }
}
</script>

<style scoped>
.host-step-container {
  max-width: 480px;
  margin: 3rem auto;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
}
.form-group {
  margin-bottom: 2rem;
}
label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}
input[type="text"] {
  width: 100%;
  padding: 0.7rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  font-size: 1.1rem;
}
input[type="file"] {
  margin-top: 0.5rem;
}
.image-preview-list {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
.image-preview-container {
  position: relative;
}
.image-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #eee;
  display: block;
}
.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff385c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.remove-image-btn:hover {
  background: #e03150;
}
.host-next-btn {
  background: #ff385c;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background 0.2s;
}
.host-next-btn:hover {
  background: #e03150;
}
</style>
