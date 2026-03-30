"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";

type TabType = "comunidades" | "contenido" | "audiencia" | "finanzas" | "ajustes" | "landing" | "landing_creador" | "eventos";

export default function CreatorStudioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("landing_creador");
  
  const [dialogState, setDialogState] = useState<{isOpen: boolean, type: 'alert'|'confirm', title: string, message: string, onConfirm?: () => void}>({isOpen: false, type: 'alert', title: '', message: ''});
  const showAlert = (title: string, message: string) => setDialogState({isOpen: true, type: 'alert', title, message});
  const showConfirm = (title: string, message: string, onConfirm: () => void) => setDialogState({isOpen: true, type: 'confirm', title, message, onConfirm});
  
  const [user, setUser] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [profileInput, setProfileInput] = useState({ full_name: '', bio: '', avatar_url: '', cover_url: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Comms State
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [communityInput, setCommunityInput] = useState({ title: '', description: '', cover_image_url: '', features: [] as {title: string, desc: string}[] });
  const [savingCommunity, setSavingCommunity] = useState(false);
  const [uploadingCommCover, setUploadingCommCover] = useState(false);
  
  const [landingEditorTab, setLandingEditorTab] = useState<'visual' | 'copy' | 'features'>('visual');
  const MAGIC_DELIMITER = "||--FEATURES--||";

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover_url' | 'avatar_url' | 'comm_cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'cover_url') setUploadingCover(true);
    else if (field === 'avatar_url') setUploadingAvatar(true);
    else setUploadingCommCover(true);

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/private/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      
      if (field === 'comm_cover') {
         setCommunityInput(prev => ({ ...prev, cover_image_url: url }));
      } else {
         setProfileInput(prev => ({ ...prev, [field]: url }));
      }
    } catch (err: any) {
      showAlert("Error", "Error subiendo imagen: " + err.message);
    } finally {
      if (field === 'cover_url') setUploadingCover(false);
      else if (field === 'avatar_url') setUploadingAvatar(false);
      else setUploadingCommCover(false);
      e.target.value = ''; // reset input
    }
  };

  useEffect(() => {
     async function loadAuth() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
           router.push('/login');
           return;
        }
        
        const { data: profile } = await supabaseClient
           .from('profiles')
           .select('*')
           .eq('id', session.user.id)
           .single();
           
        if (!profile) {
           router.push('/login');
           return;
        }
        
        if (!['creator', 'admin', 'super_admin'].includes(profile.role)) {
           router.push('/dashboard');
           return;
        }
        
        setUser(profile);
        setIsElite(profile.plan === 'elite');
        setProfileInput({ 
          full_name: profile.full_name || '', 
          bio: profile.bio || '', 
          avatar_url: profile.avatar_url || '', 
          cover_url: profile.cover_url || '' 
        });

        const { data: comms } = await supabaseClient
          .from('communities')
          .select('*')
          .eq('creator_id', profile.id);
        
        setMyCommunities(comms || []);
        if (comms && comms.length > 0) {
           setSelectedCommunityId(comms[0].id);
           const parts = (comms[0].description || '').split(MAGIC_DELIMITER);
           setCommunityInput({
              title: comms[0].title || '',
              description: parts[0] || '',
              cover_image_url: comms[0].cover_image_url || '',
              features: parts[1] ? JSON.parse(parts[1]) : []
           });
        }

        setLoadingApp(false);
     }
     loadAuth();
  }, [router]);

  const saveProfileInfo = async () => {
      setSavingProfile(true);
      const { error } = await supabaseClient
        .from('profiles')
        .update({ 
           full_name: profileInput.full_name, 
           bio: profileInput.bio, 
           avatar_url: profileInput.avatar_url, 
           cover_url: profileInput.cover_url 
        })
        .eq('id', user.id);
      
      if (!error) {
         setUser({ ...user, full_name: profileInput.full_name, bio: profileInput.bio, avatar_url: profileInput.avatar_url, cover_url: profileInput.cover_url });
      } else {
         showAlert("Error", "Error actualizando: " + error.message);
      }
      setSavingProfile(false);
  };

  const loadCommunityInfo = (id: string) => {
      setSelectedCommunityId(id);
      const com = myCommunities.find(c => c.id === id);
      if (com) {
         const parts = (com.description || '').split(MAGIC_DELIMITER);
         setCommunityInput({
            title: com.title || '',
            description: parts[0] || '',
            cover_image_url: com.cover_image_url || '',
            features: parts[1] ? JSON.parse(parts[1]) : []
         });
      }
  };

  const saveCommunityInfo = async () => {
      if (!selectedCommunityId) return;
      setSavingCommunity(true);
      
      const combinedDescription = communityInput.features.length > 0 
        ? `${communityInput.description}${MAGIC_DELIMITER}${JSON.stringify(communityInput.features)}`
        : communityInput.description;

      const { error } = await supabaseClient
         .from('communities')
         .update({
            title: communityInput.title,
            description: combinedDescription,
            cover_image_url: communityInput.cover_image_url
         })
         .eq('id', selectedCommunityId)
         .eq('creator_id', user.id);
      
      if (!error) {
         setMyCommunities(prev => prev.map(c => c.id === selectedCommunityId ? { ...c, title: communityInput.title, description: communityInput.description, cover_image_url: communityInput.cover_image_url } : c));
      } else {
         showAlert("Error", "Error actualizando landing: " + error.message);
      }
      setSavingCommunity(false);
  };

  const handlePublishToggle = async (commId: string, currentStatus: boolean) => {
     try {
        const { error } = await supabaseClient
           .from('communities')
           .update({ is_published: !currentStatus })
           .eq('id', commId);

        if (error) throw error;
        
        setMyCommunities(prev => prev.map(c => 
           c.id === commId ? { ...c, is_published: !currentStatus } : c
        ));
     } catch(e: any) {
        showAlert("Error", "Error cambiando estado: " + e.message);
     }
  };

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  const [eventsList, setEventsList] = useState<any[]>([
    {
      id: "ev_1",
      type: "Virtual (Zoom)",
      title: "Q&A con Creador Elite",
      description: "Resolución de dudas sobre el último módulo de ventas B2B.",
      date: "24 Octubre 2026",
      time: "18:30 (GMT-5)",
      registered: 42,
      visibility: "Público (Perfil)"
    },
    {
      id: "ev_2",
      type: "Presencial",
      title: "Networking Madrid Mastermind",
      description: "Encuentro exclusivo para miembros VIP y discusión de estrategias.",
      date: "15 Noviembre 2026",
      time: "20:00 (CET)",
      registered: 15,
      visibility: "SaaS Builders (Com)"
    }
  ]);
  const [eventInput, setEventInput] = useState({ title: "", type: "Virtual (Zoom)", description: "", date: "", time: "", visibility: "Público (Perfil)", link: "", location: "" });

  const handleCreateEvent = () => {
    if (!eventInput.title.trim() || !eventInput.date.trim()) return;
    setEventsList([{
      id: `ev_${Date.now()}`,
      ...eventInput,
      registered: 0
    }, ...eventsList]);
    setIsEventModalOpen(false);
    setEventInput({ title: "", type: "Virtual (Zoom)", description: "", date: "", time: "", visibility: "Público (Perfil)", link: "", location: "" });
  };

  const [isElite, setIsElite] = useState(false); // Simulated status
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const { scrollLeft, clientWidth } = tabsRef.current;
      const scrollAmount = clientWidth * 0.6; // Desplaza 60% del contenedor visible
      tabsRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Contenidos Reales DB
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [draggedModuleIdx, setDraggedModuleIdx] = useState<number | null>(null);

  const toggleAccess = async (id: string) => {
    const itemTarget = contentItems.find(i => i.id === id);
    if (!itemTarget) return;
    const nextAccess = itemTarget.access === "Muestra Gratis" ? "Premium" : itemTarget.access === "Premium" ? "Pago Especial" : "Muestra Gratis";
    
    // Update DB
    await supabaseClient.from('content_items').update({ access_level: nextAccess }).eq('id', id);
    
    // Update Local UI
    setContentItems(items => items.map(item => {
      if (item.id === id) {
        return { ...item, access: nextAccess };
      }
      return item;
    }));
  };

  const deleteItem = (id: string) => {
    showConfirm(
      "Eliminar Lección",
      "¿Seguro que deseas eliminar este contenido? Esta acción no se puede deshacer.",
      async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        await fetch(`/api/private/studio/items?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session?.access_token}` } });
        setContentItems(items => items.filter(item => item.id !== id));
        setModuleNames(prev => prev.map(m => m.id === activeModuleId ? { ...m, count: m.count - 1 } : m));
      }
    );
  };

  const toggleItemActive = async (id: string, current: boolean) => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    await fetch(`/api/private/studio/items`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ id, is_active: !current }) });
    setContentItems(contentItems.map(item => item.id === id ? { ...item, is_active: !current } : item));
  };
  
  const deleteModule = (id: string) => {
    showConfirm(
      "Eliminar Módulo",
      "¿Seguro que quieres eliminar este módulo y todo su contenido? Esta acción no se puede deshacer.",
      async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        await fetch(`/api/private/studio/modules?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session?.access_token}` } });
        setModuleNames(moduleNames.filter(m => m.id !== id));
        if (activeModuleId === id) setActiveModuleId(moduleNames[0]?.id || null);
      }
    );
  };
  
  const toggleModuleActive = async (id: string, current: boolean) => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    await fetch(`/api/private/studio/modules`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ id, is_active: !current }) });
    setModuleNames(moduleNames.map(m => m.id === id ? { ...m, is_active: !current } : m));
  };

  const onDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragEnter = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    
    const items = [...contentItems];
    const draggedItem = items[draggedIdx];
    items.splice(draggedIdx, 1);
    items.splice(idx, 0, draggedItem);
    
    setDraggedIdx(idx);
    setContentItems(items);
  };
  
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIdx !== null) {
       const updates = contentItems.map((it, i) => ({ id: it.id, order_index: i }));
       const { data: { session } } = await supabaseClient.auth.getSession();
       await fetch('/api/private/studio/items/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ updates })
       });
    }
    setDraggedIdx(null);
  };

  const onDragModuleStart = (e: React.DragEvent, idx: number) => {
    setDraggedModuleIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragModuleEnter = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedModuleIdx === null || draggedModuleIdx === idx) return;
    
    const items = [...moduleNames];
    const draggedItem = items[draggedModuleIdx];
    items.splice(draggedModuleIdx, 1);
    items.splice(idx, 0, draggedItem);
    
    setDraggedModuleIdx(idx);
    setModuleNames(items);
  };
  
  const onDropModule = async (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedModuleIdx !== null) {
       const updates = moduleNames.map((it, i) => ({ id: it.id, order_index: i }));
       const { data: { session } } = await supabaseClient.auth.getSession();
       await fetch('/api/private/studio/modules/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ updates })
       });
    }
    setDraggedModuleIdx(null);
  };

  // Modulos Reales DB
  const [moduleNames, setModuleNames] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  useEffect(() => {
     async function fetchModules() {
        if (!selectedCommunityId) {
            setModuleNames([]);
            return;
        }
        const { data } = await supabaseClient
           .from('content_modules')
           .select('id, title, description, cover_image_url, order_index, is_active, created_at, content_items(count)')
           .eq('community_id', selectedCommunityId)
           .order('order_index', { ascending: true })
           .order('created_at', { ascending: false });
           
        if (data) {
           const mapped = data.map((m: any) => ({
              id: m.id,
              name: m.title,
              count: m.content_items[0]?.count || 0,
              order_index: m.order_index,
              is_active: m.is_active !== false,
              description: m.description,
              cover_image_url: m.cover_image_url
           }));
           setModuleNames(mapped);
           if (mapped.length > 0 && (!activeModuleId || !mapped.find((x: any) => x.id === activeModuleId))) {
              setActiveModuleId(mapped[0].id);
           }
        }
     }
     if (activeTab === "contenido") fetchModules();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCommunityId, activeTab]);

  useEffect(() => {
     async function fetchItems() {
        if (!activeModuleId) {
           setContentItems([]);
           return;
        }
        const { data } = await supabaseClient
           .from('content_items')
           .select('*')
           .eq('module_id', activeModuleId)
           .order('order_index', { ascending: true });
           
        if (data) {
           setContentItems(data.map((item: any) => ({
              id: item.id,
              title: item.title,
              type: item.type,
              platform: item.platform,
              url: item.video_url || item.media_url,
              duration: item.duration_string || 'N/A',
              date: new Date(item.created_at).toLocaleDateString(),
              access: item.access_level,
              secure: item.is_secure,
              order_index: item.order_index,
              is_active: item.is_active !== false
           })));
        }
     }
     if (activeTab === "contenido") fetchItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleId, activeTab]);

  // Modals
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editModuleId, setEditModuleId] = useState<string | null>(null);
  const [moduleInputName, setModuleInputName] = useState("");
  const [moduleInputDesc, setModuleInputDesc] = useState("");
  const [moduleImageUrl, setModuleImageUrl] = useState("");
  const [uploadingModuleImage, setUploadingModuleImage] = useState(false);

  const handleUploadModuleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     setUploadingModuleImage(true);
     try {
       const { data: { session } } = await supabaseClient.auth.getSession();
       const formData = new FormData();
       formData.append('file', file);
       const res = await fetch('/api/private/upload', {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${session?.access_token}` },
         body: formData
       });
       if (!res.ok) throw new Error("Upload failed");
       const { url } = await res.json();
       setModuleImageUrl(url);
     } catch (err: any) {
       showAlert("Error", "Error subiendo imagen: " + err.message);
     } finally {
       setUploadingModuleImage(false);
     }
  };

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editMaterialId, setEditMaterialId] = useState<string | null>(null);
  const [materialInput, setMaterialInput] = useState({ title: "", type: "VIDEO", platform: "youtube", access: "Muestra Gratis", description: "", price: "", video_url: "", media_url: "" });
  const [uploadingMaterialFile, setUploadingMaterialFile] = useState(false);
  
  const handleUploadMaterialFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     setUploadingMaterialFile(true);
     try {
       const { data: { session } } = await supabaseClient.auth.getSession();
       const formData = new FormData();
       formData.append('file', file);
       const res = await fetch('/api/private/upload', {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${session?.access_token}` },
         body: formData
       });
       if (!res.ok) throw new Error("Upload failed");
       const { url } = await res.json();
       setMaterialInput(prev => ({ ...prev, media_url: url }));
     } catch (err: any) {
       showAlert("Error", "Error subiendo archivo: " + err.message);
     } finally {
       setUploadingMaterialFile(false);
     }
  };

  const handleCreateModule = async () => {
    if(!moduleInputName.trim() || !moduleInputDesc.trim() || !moduleImageUrl || !selectedCommunityId) {
       showAlert("Campos Incompletos", "Por favor completa el título, la descripción y sube la imagen de portada del módulo.");
       return;
    }
    
    if (editModuleId) {
       const { data: { session } } = await supabaseClient.auth.getSession();
       const res = await fetch(`/api/private/studio/modules`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ id: editModuleId, name: moduleInputName, description: moduleInputDesc, cover_image_url: moduleImageUrl }) });
       if (res.ok) {
          setModuleNames(moduleNames.map(m => m.id === editModuleId ? { ...m, name: moduleInputName, description: moduleInputDesc, cover_image_url: moduleImageUrl } : m));
       } else showAlert("Error", "Error al editar módulo");
    } else {
       const { data: { session } } = await supabaseClient.auth.getSession();
       const res = await fetch('/api/private/studio/modules', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ community_id: selectedCommunityId, name: moduleInputName, description: moduleInputDesc, cover_image_url: moduleImageUrl }) });
       if (res.ok) {
          const { module } = await res.json();
          setModuleNames([{ id: module.id, name: module.title, count: 0, is_active: module.is_active, description: module.description, cover_image_url: module.cover_image_url }, ...moduleNames]);
          setActiveModuleId(module.id);
       } else showAlert("Error", "Error creating module");
    }
    
    setModuleInputName("");
    setModuleInputDesc("");
    setModuleImageUrl("");
    setEditModuleId(null);
    setIsModuleModalOpen(false);
  };

  const handleCreateMaterial = async () => {
    if(!materialInput.title.trim() || !activeModuleId) return;
    
    const hasPDF = contentItems.some(item => item.type === "PDF");
    if (materialInput.type === "PDF" && hasPDF && !isElite) {
       setShowUpgradeModal(true);
       return;
    }
    
    if (editMaterialId) {
       const { data: { session } } = await supabaseClient.auth.getSession();
       const res = await fetch(`/api/private/studio/items`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ id: editMaterialId, title: materialInput.title, type: materialInput.type, platform: materialInput.type === "PDF" ? null : materialInput.platform, media_url: materialInput.type === "NATIVE" ? materialInput.media_url : materialInput.video_url, access_level: materialInput.access }) });
       if (res.ok) {
          setContentItems(contentItems.map(item => item.id === editMaterialId ? {
              ...item,
              title: materialInput.title,
              type: materialInput.type,
              platform: materialInput.type === "PDF" ? null : materialInput.platform,
              url: materialInput.type === "NATIVE" ? materialInput.media_url : materialInput.video_url,
              access: materialInput.access
          } : item));
       } else showAlert("Error", "Error al editar lección");
    } else {
       const { data: { session } } = await supabaseClient.auth.getSession();
       const res = await fetch(`/api/private/studio/items`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ module_id: activeModuleId, title: materialInput.title, type: materialInput.type, platform: materialInput.type === "PDF" ? null : materialInput.platform, media_url: materialInput.type === "NATIVE" ? materialInput.media_url : materialInput.video_url, access_level: materialInput.access }) });
       if (res.ok) {
          const { item: insertedItem } = await res.json();
          setContentItems([...contentItems, {
             id: insertedItem.id,
             title: insertedItem.title,
             type: insertedItem.type,
             platform: insertedItem.platform,
             url: insertedItem.video_url || insertedItem.media_url,
             duration: insertedItem.duration_string || 'N/A',
             date: new Date(insertedItem.created_at).toLocaleDateString(),
             access: insertedItem.access_level,
             secure: insertedItem.is_secure,
             order_index: insertedItem.order_index,
             is_active: insertedItem.is_active !== false
          }]);
          setModuleNames(moduleNames.map(m => m.id === activeModuleId ? {...m, count: m.count + 1} : m));
       } else showAlert("Error", "Error creating item");
    }
    
    setMaterialInput({ title: "", type: "VIDEO", platform: "youtube", access: "Muestra Gratis", description: "", price: "", video_url: "", media_url: "" });
    setEditMaterialId(null);
    setIsMaterialModalOpen(false);
  };

  const hasPDFUploaded = contentItems.some((item: any) => item.type === "PDF");


  // Mock data for members
  const audience = [
    { id: 1, name: "Carolina Mendoza", email: "caro@example.com", date: "Hace 2 horas", status: "Premium", rev: "$29.00" },
    { id: 2, name: "Miguel Santander", email: "msan@example.com", date: "Hace 5 horas", status: "Gratis", rev: "$0.00" },
    { id: 3, name: "Lorena Paz", email: "lore.pz@example.com", date: "Ayer", status: "Premium", rev: "$29.00" },
    { id: 4, name: "Daniel Rivas", email: "d.rivas@example.com", date: "Ayer", status: "Premium", rev: "$29.00" },
    { id: 5, name: "Sofía Vergara", email: "sofiav@example.com", date: "Hace 2 días", status: "Gratis", rev: "$0.00" },
  ];

  return (
    <>
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 pb-20 px-6 min-h-screen bg-surface">
        {loadingApp ? (
          <div className="w-full h-[60vh] flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
          </div>
        ) : (
        <>
        <div className="w-full max-w-7xl mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                 <span className="material-symbols-outlined text-sm font-bold">verified</span>
                 <p className="text-xs font-black uppercase tracking-widest">Centro de Creador</p>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
                Studio
              </h1>
            </div>
            <div className="flex gap-4 items-center">
              <button onClick={() => setIsHelpModalOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/20 px-6 py-3 rounded-full font-extrabold active:scale-95 transition-all text-sm flex items-center gap-2">
                 <span className="material-symbols-outlined text-lg">lightbulb</span>
                 <span className="hidden sm:inline">Guía del Studio</span>
              </button>
              <Link href="/create">
                <button className="px-6 py-3 bg-primary text-white font-extrabold rounded-full hover:bg-primary-container shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm flex items-center gap-2">
                   <span className="material-symbols-outlined text-lg">add_circle</span>
                   <span className="hidden sm:inline">Nueva Comunidad</span>
                </button>
              </Link>
            </div>
          </header>

          <div className="flex flex-col mb-10">
             <div className="flex justify-between items-end mb-4">
                <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Opciones Generales</h2>
                <div className="flex items-center gap-2 hidden md:flex">
                   <button 
                     onClick={() => scrollTabs('left')}
                     className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                   >
                     <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                   </button>
                   <button 
                     onClick={() => scrollTabs('right')}
                     className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                   >
                     <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                   </button>
                </div>
             </div>

             <div 
                ref={tabsRef}
                className="flex gap-2 overflow-x-auto no-scrollbar border-b border-outline-variant/15 pb-4 scroll-smooth"
             >
                {[
                  { id: "landing_creador", label: "Perfil de Creador", icon: "badge" },
                  { id: "landing", label: "Landing Comunidad", icon: "web" },
                  { id: "comunidades", label: "Tus Comunidades", icon: "apps" },
                  { id: "contenido", label: "Contenido y Librería", icon: "video_library" },
                  { id: "eventos", label: "Eventos & Clases", icon: "calendar_month" },
                  { id: "audiencia", label: "Audiencia y Miembros", icon: "group" },
                  { id: "finanzas", label: "Finanzas y Pagos", icon: "monitoring" },
                  { id: "ajustes", label: "Ajustes de Creador", icon: "tune" },
                ].map((tab) => (
                   <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as TabType)}
                     className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                        activeTab === tab.id 
                          ? "bg-surface-container-highest text-on-surface shadow-sm"
                          : "text-on-surface-variant hover:bg-surface-container-low"
                     }`}
                   >
                      <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                      {tab.label}
                   </button>
                ))}
             </div>
          </div>

          {/* TAB 1: COMUNIDADES */}
          {activeTab === "comunidades" && (
             <div className="animate-in fade-in duration-500">
               {/* Quick Metrics */}
               <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {[
                     { icon: "group", label: "Miembros Totales", value: "3,402", trend: "+12%" },
                     { icon: "payments", label: "MRR (Resumen)", value: "$2,840.50", trend: "+5.4%" },
                     { icon: "school", label: "Cursos Activos", value: "14", trend: "" },
                     { icon: "forum", label: "Temas de Hoy", value: "128", trend: "+32%" },
                  ].map((metric, i) => (
                     <article key={i} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                           <span className="material-symbols-outlined text-outline-variant p-2 rounded-xl bg-surface-container-high/50">{metric.icon}</span>
                           {metric.trend && <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">{metric.trend}</span>}
                        </div>
                        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{metric.label}</h3>
                        <p className="text-2xl font-black text-on-surface">{metric.value}</p>
                     </article>
                  ))}
               </section>

               <section>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                     <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                        Inventario de Comunidades
                     </h2>
                     <Link href="/create">
                        <button className="px-6 py-2.5 bg-primary text-white font-extrabold rounded-xl hover:bg-primary-container shadow-md shadow-primary/20 active:scale-95 transition-all text-sm flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm">add</span> Nueva Comunidad
                        </button>
                     </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     
                     {myCommunities.length === 0 ? (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                           <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">disabled_by_default</span>
                           <h3 className="text-lg font-bold text-on-surface mb-2">No tienes comunidades creadas</h3>
                           <p className="text-on-surface-variant text-sm mb-6">Empieza a construir tu tribu y diseña tu conocimiento.</p>
                           <Link href="/create">
                              <button className="px-6 py-3 bg-primary text-white font-extrabold rounded-full hover:bg-primary-container shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm">
                                 Crear mi primera comunidad
                              </button>
                           </Link>
                        </div>
                     ) : (
                        myCommunities.map((comm) => (
                           <div key={comm.id} className={`bg-surface-container-lowest border border-outline-variant/15 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full relative transition-all duration-300 ${comm.is_published ? 'hover:shadow-xl hover:-translate-y-1 group' : 'opacity-70 hover:opacity-100'}`}>
                              <div className="h-48 bg-surface-container-high relative border-b border-outline-variant/10 flex items-center justify-center overflow-hidden">
                                 {comm.cover_image_url ? (
                                    <img
                                       alt={comm.title}
                                       className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${comm.is_published ? 'group-hover:scale-105' : ''}`}
                                       src={comm.cover_image_url}
                                    />
                                 ) : (
                                    <span className="material-symbols-outlined text-5xl text-outline-variant">image_not_supported</span>
                                 )}
                                 {comm.cover_image_url && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>}
                                 
                                 <button 
                                    onClick={() => handlePublishToggle(comm.id, comm.is_published)}
                                    className={`absolute top-4 right-4 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 active:scale-95 transition-all outline-none ${comm.is_published ? 'bg-green-500 hover:bg-green-600' : 'bg-outline-variant hover:bg-on-surface-variant'}`}
                                 >
                                    <span className="material-symbols-outlined text-[14px]">{(comm as any).is_published ? 'public' : 'visibility_off'}</span>
                                    {comm.is_published ? 'Publicada' : 'Borrador'}
                                 </button>
                              </div>
                              
                              <div className="p-6 pt-10 flex flex-col flex-1 relative z-10 bg-surface-container-lowest">
                                 <div className="absolute -top-8 left-6 z-20 w-16 h-16 rounded-full border-4 border-surface-container-lowest bg-surface-container flex items-center justify-center overflow-hidden shadow-lg">
                                    {profileInput.avatar_url ? (
                                       <img src={profileInput.avatar_url} alt="Tu Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                       <span className="text-xl font-bold uppercase">{profileInput.full_name?.charAt(0) || "C"}</span>
                                    )}
                                 </div>
                                 <h3 className="font-extrabold text-xl text-on-surface mb-2 leading-tight">{comm.title || 'Sin Título'}</h3>
                                 <p className="text-on-surface-variant text-sm mb-6 flex-1 text-balance">
                                    {comm.description ? comm.description.split(MAGIC_DELIMITER)[0] : '(Sin descripción editada todavía)'}
                                 </p>
                                 
                                 <div className="flex items-center justify-between mb-6 pb-6 border-b border-outline-variant/10">
                                    <div className="flex items-center gap-2 text-on-surface-variant">
                                       <span className="material-symbols-outlined text-[18px]">group</span>
                                       <span className="text-sm font-bold">0</span>
                                    </div>
                                    <span className={`text-sm font-black px-2 py-1 rounded ${comm.price_tier === 'Gratis' ? 'text-green-600 bg-green-500/10' : 'text-amber-600 bg-amber-500/10'}`}>
                                       {comm.price_tier || 'Gratis'}
                                    </span>
                                 </div>

                                 <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <button 
                                       onClick={() => { loadCommunityInfo(comm.id); setActiveTab("landing"); }}
                                       className="w-full py-2.5 bg-surface-container-high hover:bg-surface-container-highest flex justify-center text-on-surface text-xs font-bold rounded-xl transition-colors"
                                    >
                                       Modificar Info
                                    </button>
                                    <button 
                                       onClick={() => setActiveTab("audiencia")}
                                       className="w-full py-2.5 bg-primary text-white hover:bg-primary-container flex justify-center text-xs font-bold rounded-xl transition-colors shadow-md shadow-primary/20"
                                    >
                                       Gestionar
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}

                  </div>
               </section>
             </div>
          )}          {/* TAB LANDING PAGE */}
          {activeTab === "landing" && (
             <div className="animate-in fade-in duration-500">
               <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                     <h2 className="text-xl font-bold text-on-surface">Diseño de Landing Page</h2>
                     <p className="text-sm text-on-surface-variant">Edita los textos de venta, imágenes y promesas de tu ecosistema.</p>
                  </div>
                  <Link href={selectedCommunityId ? `/c/${selectedCommunityId}` : "#"} className="shrink-0">
                    <button className="px-6 py-2.5 bg-surface-container-highest text-on-surface hover:text-primary hover:bg-surface-container-low text-sm font-bold rounded-xl shadow-sm border border-outline-variant/20 active:scale-95 transition-all flex items-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">visibility</span>
                       Ver Previsualización
                    </button>
                  </Link>
               </header>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  <div className="lg:col-span-1 border border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-6 h-fit shadow-sm">
                     <h3 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-4 pb-4 border-b border-outline-variant/10">Selecciona Comunidad</h3>
                     <select 
                        className="w-full bg-surface-container-high border border-outline-variant/20 text-sm focus:border-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-colors appearance-none mb-6 cursor-pointer"
                        value={selectedCommunityId || ""}
                        onChange={(e) => loadCommunityInfo(e.target.value)}
                     >
                        {myCommunities.map(c => (
                           <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                     </select>
                     
                     <div className="flex flex-col gap-2">
                        <div 
                           onClick={() => setLandingEditorTab('visual')}
                           className={`p-3 font-bold text-sm rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${landingEditorTab === 'visual' ? 'bg-surface-container text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                        >
                           <span className="material-symbols-outlined text-[18px]">image</span> Diseño Visual (Imágenes)
                        </div>
                        <div 
                           onClick={() => setLandingEditorTab('copy')}
                           className={`p-3 font-bold text-sm rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${landingEditorTab === 'copy' ? 'bg-surface-container text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                        >
                           <span className="material-symbols-outlined text-[18px]">edit_note</span> Textos Clave y Títulos
                        </div>
                        <div 
                           onClick={() => setLandingEditorTab('features')}
                           className={`p-3 font-bold text-sm rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${landingEditorTab === 'features' ? 'bg-surface-container text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                        >
                           <span className="material-symbols-outlined text-[18px]">list_alt</span> Lo que incluye (Features)
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col gap-8">
                     
                     {landingEditorTab === 'visual' && (
                     <div className="border border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-8 shadow-sm animate-in fade-in duration-300">
                        <h3 className="font-bold text-xl text-on-surface mb-2">Elementos Visuales</h3>
                        <p className="text-sm text-on-surface-variant font-medium mb-8">Las imágenes que impactan a tus visitantes al aterrizar en tu página.</p>
                        
                        <div className="flex flex-col gap-8">
                           <div>
                              <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                                 <label className="block text-sm font-bold text-on-surface">Banner de Portada Promocional</label>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest bg-surface-container px-2 py-1.5 rounded-md">JPG / PNG</span>
                                    <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-500 px-3 py-1.5 rounded-md shadow-md flex items-center gap-1">
                                       <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                                       GIF Animado (ELITE)
                                    </span>
                                 </div>
                              </div>
                              <div className="w-full h-40 md:h-56 border-2 border-dashed border-outline-variant/50 rounded-2xl flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high/50 hover:border-primary transition-all cursor-pointer group bg-surface overflow-hidden relative shadow-inner">
                                 <input type="file" accept="image/*" onChange={e => handleUploadImage(e, 'comm_cover')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" />
                                 <img src={communityInput.cover_image_url || "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif"} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-opacity" />
                                 
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                 
                                 <span className="material-symbols-outlined text-4xl mb-2 z-10 text-white drop-shadow-md">{uploadingCommCover ? 'refresh' : 'cloud_upload'}</span>
                                 <span className="text-sm font-bold z-10 text-white drop-shadow-md px-2 text-center">{uploadingCommCover ? 'Subiendo...' : 'Click para reemplazar portada'}</span>
                              </div>
                              <div className="text-xs text-amber-600 font-medium mt-3 flex items-start gap-2 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                                 <span className="material-symbols-outlined text-[18px] shrink-0">info</span>
                                 <p className="leading-relaxed">
                                    Sabías qué: Creadores con <strong>Portadas Animadas (GIFs)</strong> atraen un <strong>+300% más de atención e inscripciones</strong> provenientes de la pestaña de Tendencias Rápidas y el Home. (Exclusivo Plan ELITE).
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                     )}
                     
                     {landingEditorTab === 'copy' && (
                     <div className="border border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-8 shadow-sm animate-in fade-in duration-300">
                        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-2">
                           <h3 className="font-bold text-xl text-on-surface">Textos (Copywriting)</h3>
                           <button onClick={saveCommunityInfo} disabled={savingCommunity || !selectedCommunityId} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg hover:bg-primary-container active:scale-95 transition-all w-full md:w-auto flex items-center justify-center gap-2">
                              {savingCommunity ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : "Guardar Cambios"}
                           </button>
                        </div>
                        <p className="text-sm text-on-surface-variant font-medium mb-8">El mensaje de venta principal de tu página.</p>
                        
                        <div className="flex flex-col gap-6">
                           <div>
                              <label className="block text-xs font-bold text-on-surface mb-2">Nombre de la Comunidad <span className="text-red-500">*</span></label>
                              <input 
                                 type="text" 
                                 value={communityInput.title}
                                 onChange={e => setCommunityInput({...communityInput, title: e.target.value})}
                                 className="w-full bg-surface-container-high border-2 border-outline-variant/10 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-bold outline-none transition-colors"
                              />
                           </div>

                           <div>
                              <label className="block text-xs font-bold text-on-surface mb-2">Promesa / Descripción Corta</label>
                              <textarea 
                                 rows={5}
                                 value={communityInput.description}
                                 onChange={e => setCommunityInput({...communityInput, description: e.target.value})}
                                 className="w-full bg-surface-container-high border-2 border-outline-variant/10 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-medium outline-none transition-colors resize-y min-h-[140px]"
                              ></textarea>
                           </div>
                        </div>
                     </div>
                     )}

                     {landingEditorTab === 'features' && (
                     <div className="border border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-8 shadow-sm animate-in fade-in duration-300 flex flex-col">
                        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-2">
                           <h3 className="font-bold text-xl text-on-surface">Lo que incluye (Features)</h3>
                           <button onClick={saveCommunityInfo} disabled={savingCommunity || !selectedCommunityId} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg hover:bg-primary-container active:scale-95 transition-all w-full md:w-auto flex items-center justify-center gap-2">
                              {savingCommunity ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : "Guardar Cambios"}
                           </button>
                        </div>
                        <p className="text-sm text-on-surface-variant font-medium mb-8">Añade los beneficios específicos que ofreces al unirse a tu ecosistema.</p>
                        
                        <div className="flex flex-col gap-4 mb-6">
                           {communityInput.features.map((feat, i) => (
                              <div key={i} className="flex gap-4 items-start bg-surface-container p-4 rounded-xl border border-outline-variant/10">
                                 <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                                 <div className="flex-1 flex flex-col gap-2">
                                    <input 
                                       type="text" 
                                       value={feat.title}
                                       placeholder="Título del beneficio (ej: Chat Privado)"
                                       onChange={e => {
                                          const newF = [...communityInput.features];
                                          newF[i].title = e.target.value;
                                          setCommunityInput({...communityInput, features: newF});
                                       }}
                                       className="w-full bg-transparent border-b border-outline-variant/20 focus:border-primary px-1 py-1 text-on-surface font-bold outline-none transition-colors shadow-none text-sm"
                                    />
                                    <textarea 
                                       rows={2}
                                       value={feat.desc}
                                       placeholder="Descripción breve..."
                                       onChange={e => {
                                          const newF = [...communityInput.features];
                                          newF[i].desc = e.target.value;
                                          setCommunityInput({...communityInput, features: newF});
                                       }}
                                       className="w-full bg-transparent border-b border-outline-variant/20 focus:border-primary px-1 py-1 text-on-surface font-medium outline-none transition-colors shadow-none text-xs resize-none"
                                    ></textarea>
                                 </div>
                                 <button 
                                    onClick={() => {
                                       const newF = communityInput.features.filter((_, idx) => idx !== i);
                                       setCommunityInput({...communityInput, features: newF});
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors self-center"
                                 >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                 </button>
                              </div>
                           ))}
                           
                           {communityInput.features.length === 0 && (
                              <div className="text-center py-6 text-on-surface-variant bg-surface-container-high rounded-xl text-sm border border-dashed border-outline-variant/30">
                                 No tienes features configurados. Añade el primero.
                              </div>
                           )}
                        </div>

                        <button 
                           onClick={() => setCommunityInput({...communityInput, features: [...communityInput.features, {title: '', desc: ''}]})}
                           className="w-full py-3 border-2 border-dashed border-primary text-primary hover:bg-primary/5 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm outline-none"
                        >
                           <span className="material-symbols-outlined text-[18px]">add_circle</span> Añadir nuevo beneficio
                        </button>
                     </div>
                     )}
                  </div>
               </div>
             </div>
           )}

           {/* TAB PERFIL DE CREADOR */}
           {activeTab === "landing_creador" && (
             <div className="animate-in fade-in duration-500">
               <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                     <h2 className="text-xl font-bold text-on-surface">Página Pública de Creador</h2>
                     <p className="text-sm text-on-surface-variant">Diseña el portafolio donde agrupas todas tus comunidades e impacto global.</p>
                  </div>
                  <Link href="/creators" className="shrink-0">
                    <button className="px-6 py-2.5 bg-surface-container-highest text-on-surface hover:text-primary hover:bg-surface-container-low text-sm font-bold rounded-xl shadow-sm border border-outline-variant/20 active:scale-95 transition-all flex items-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                       Ver Directorio
                    </button>
                  </Link>
               </header>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <div className="flex flex-col gap-6">
                     {/* Cover Photo Editor */}
                     <div className="border border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-8 shadow-sm">
                        <h3 className="font-bold text-lg text-on-surface mb-2 flex items-center gap-2">
                           <span className="material-symbols-outlined text-primary">wallpaper</span>
                           Portada del Creador
                        </h3>
                        <p className="text-sm text-on-surface-variant font-medium mb-6">La imagen principal de fondo que transmite tu vibra.</p>
                        
                        <div className="w-full h-32 md:h-40 border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high/50 hover:border-primary transition-all group bg-surface overflow-hidden relative shadow-inner mb-4 cursor-pointer">
                           <input type="file" accept="image/*" onChange={e => handleUploadImage(e, 'cover_url')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" />
                           <img src={profileInput.cover_url || `https://picsum.photos/1920/400?blur=1`} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-opacity" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                           <span className="material-symbols-outlined text-4xl mb-2 text-white z-10 drop-shadow-md">
                              {uploadingCover ? 'refresh' : 'wallpaper'}
                           </span>
                           <span className="text-sm font-bold z-10 text-white drop-shadow-md px-4 text-center">
                              {uploadingCover ? 'Subiendo...' : 'Click para subir portada'}
                           </span>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-on-surface mb-2">Enlace de Imagen (URL Portada)</label>
                           <input 
                              type="text" 
                              placeholder="https://..."
                              value={profileInput.cover_url}
                              onChange={(e) => setProfileInput({...profileInput, cover_url: e.target.value})}
                              className="w-full bg-surface-container-high border-2 border-outline-variant/10 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-medium outline-none transition-colors"
                           />
                        </div>
                     </div>

                     <div className="border border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-8 shadow-sm">
                        <h3 className="font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
                           <span className="material-symbols-outlined text-primary">badge</span>
                           Tu Identidad Digital
                        </h3>
                        <div className="flex flex-col gap-5">
                           <div>
                              <label className="block text-xs font-bold text-on-surface mb-2">Avatar del Creador (Imagen JPG/PNG)</label>
                              <div className="flex gap-4 items-center mb-4">
                                 <div className="w-16 h-16 rounded-full border-2 border-outline-variant/20 flex items-center justify-center bg-surface overflow-hidden shrink-0">
                                    {profileInput.avatar_url ? (
                                       <img src={profileInput.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                       <span className="text-xl font-bold uppercase">{profileInput.full_name?.charAt(0) || "U"}</span>
                                    )}
                                 </div>
                                 <div className="relative">
                                    <button className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-sm font-bold flex items-center gap-2 border border-outline-variant/10 text-on-surface transition-colors cursor-pointer pointer-events-none">
                                       <span className="material-symbols-outlined text-[18px]">{uploadingAvatar ? 'refresh' : 'upload'}</span>
                                       {uploadingAvatar ? 'Subiendo...' : 'Subir Imagen'}
                                    </button>
                                    <input 
                                       type="file" 
                                       accept="image/*"
                                       onChange={(e) => handleUploadImage(e, 'avatar_url')}
                                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-on-surface mb-2">Nombre de Creador</label>
                              <input 
                                 type="text" 
                                 value={profileInput.full_name}
                                 onChange={(e) => setProfileInput({...profileInput, full_name: e.target.value})}
                                 className="w-full bg-surface-container-high border-2 border-outline-variant/10 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-medium outline-none transition-colors"
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-on-surface mb-2">Biografía / Pitch de Venta Automático</label>
                              <textarea 
                                 rows={3}
                                 value={profileInput.bio}
                                 onChange={(e) => setProfileInput({...profileInput, bio: e.target.value})}
                                 className="w-full bg-surface-container-high border-2 border-outline-variant/10 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-medium outline-none transition-colors resize-none"
                              ></textarea>
                           </div>
                           <button 
                             onClick={saveProfileInfo} 
                             disabled={savingProfile} 
                             className="w-full py-3 bg-primary text-white text-sm font-extrabold rounded-xl hover:bg-primary-container active:scale-95 transition-all shadow-sm flex justify-center items-center h-12"
                           >
                             {savingProfile ? <span className="material-symbols-outlined animate-spin">refresh</span> : "Guardar Información"}
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-6">
                     <div className="border border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-4 mb-2">
                           <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 relative z-10">
                              <span className="material-symbols-outlined text-amber-500">public</span>
                              Dominio Propio de Autoridad
                           </h3>
                           <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-500 px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 shrink-0 relative z-10">
                              <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                              <span className="hidden sm:inline">Plan</span> ELITE
                           </span>
                        </div>
                        
                        <p className="text-sm text-on-surface-variant font-medium relative z-10 mb-4">Enlaza tu página de Creador directamente a tu dominio marca personal (ej: tucuenta.com en vez de koomun.com/c/tucuenta).</p>

                        <div className="flex flex-col gap-4 relative z-10">
                           <div className="flex flex-col sm:flex-row gap-3">
                              <input 
                                 type="text" 
                                 placeholder="www.tu-dominio-propio.com"
                                 className="flex-1 bg-surface-container-high border-2 border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface font-bold outline-none cursor-pointer hover:border-amber-500/50 focus:border-amber-500 transition-colors"
                              />
                              <button className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-sm sm:text-xs px-6 py-3 sm:py-0 rounded-xl shadow-sm transition-colors w-full sm:w-auto shrink-0 flex items-center justify-center">
                                 CONECTAR
                              </button>
                           </div>
                           <p className="text-xs text-on-surface-variant flex items-start gap-2">
                              <span className="material-symbols-outlined text-[14px] text-amber-500 shrink-0">info</span>
                              Generamos certificados SSL automáticos globales usando infraestructura en el edge para latencia cero.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
             </div>
           )}


           {/* TAB 1.5: GESTIÓN DE CONTENIDO (AULAS Y CURSOS) */}
           {activeTab === "contenido" && (
             <div className="animate-in fade-in duration-500">
               
               <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                     <h2 className="text-xl font-bold text-on-surface">Gestor de Contenidos</h2>
                     <p className="text-sm text-on-surface-variant">Sube videos (Vimeo/YouTube) o adjunta PDFs y bloquéalos bajo pago.</p>
                  </div>
                  <button onClick={() => setIsMaterialModalOpen(true)} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2">
                     <span className="material-symbols-outlined text-[18px]">upload_file</span>
                     Subir Material
                  </button>
               </header>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Menu lateral de Cursos vs Subidas */}
                  <div className="lg:col-span-1 border border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-6 h-fit shadow-sm">
                     <h3 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-4 pb-4 border-b border-outline-variant/10">Selecciona Comunidad</h3>
                     <select 
  className="w-full bg-surface-container-high border border-outline-variant/20 text-sm focus:border-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-colors appearance-none mb-6"
  value={selectedCommunityId || ""}
  onChange={(e) => loadCommunityInfo(e.target.value)}
>
  {myCommunities.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
</select>

                     <h3 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-4 pb-4 border-b border-outline-variant/10">Catálogo de Contenido</h3>
                     <ul className="flex flex-col gap-2">
                        {moduleNames.map((mod, index) => (
                           <li 
  key={mod.id} 
  onClick={() => setActiveModuleId(mod.id)}
  draggable
  onDragStart={(e) => onDragModuleStart(e, index)}
  onDragEnter={(e) => onDragModuleEnter(e, index)}
  onDragOver={(e) => e.preventDefault()}
  onDragEnd={onDropModule}
  className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all shadow-sm ${draggedModuleIdx === index ? 'opacity-50' : 'opacity-100'} ${
   activeModuleId === mod.id 
     ? "bg-surface-container text-on-surface font-bold text-sm border-l-4 border-primary hover:shadow-md" 
     : "text-on-surface-variant font-medium hover:bg-surface-container-low text-sm"
   }`}
>
  <div className="flex-1 truncate pr-2">{mod.name}</div>
  <div className="flex items-center gap-1 sm:gap-2">
      <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${activeModuleId === mod.id ? 'bg-surface text-on-surface-variant' : 'bg-surface-container'}`}>
         {mod.count} ítems
      </span>
      <span onClick={(e) => { e.stopPropagation(); setEditModuleId(mod.id); setModuleInputName(mod.name); setModuleInputDesc(mod.description || ''); setModuleImageUrl(mod.cover_image_url || ''); setIsModuleModalOpen(true); }} className="material-symbols-outlined text-[16px] sm:text-[18px] text-outline-variant hover:text-blue-500 hover:bg-blue-500/10 rounded p-1 transition-colors z-10 relative">edit</span>
      <span onClick={(e) => { e.stopPropagation(); toggleModuleActive(mod.id, mod.is_active); }} className={`material-symbols-outlined text-[16px] sm:text-[18px] rounded p-1 transition-colors z-10 relative cursor-pointer ${mod.is_active ? 'text-green-500 hover:bg-green-500/10' : 'text-outline-variant hover:text-green-500 hover:bg-green-500/10'}`}>{mod.is_active ? 'visibility' : 'visibility_off'}</span>
      <span onClick={(e) => { e.stopPropagation(); deleteModule(mod.id); }} className="material-symbols-outlined text-[16px] sm:text-[18px] text-outline-variant hover:text-red-500 hover:bg-red-500/10 rounded p-1 transition-colors z-10 relative cursor-pointer">delete</span>
  </div>
</li>
                        ))}
                        
                        <li 
                           onClick={() => setIsModuleModalOpen(true)}
                           className="mt-4 border-2 border-dashed border-outline-variant/30 text-primary font-bold hover:bg-surface-container-low text-sm p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                           <span className="material-symbols-outlined text-[18px]">add</span> Nuevo Módulo
                        </li>
                     </ul>
                  </div>

                  {/* Editor Activo (Gestor de Contenido) */}
                  <div className="lg:col-span-2 border border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-6 shadow-sm overflow-hidden relative">
                     <div className="flex items-center gap-4 mb-6 pb-4 border-b border-outline-variant/10">
                        <span className="material-symbols-outlined text-4xl text-primary bg-primary/10 p-2 rounded-xl">play_lesson</span>
                        <div>
                           <h2 className="text-2xl font-black text-on-surface leading-tight">{moduleNames.find(m => m.id === activeModuleId)?.name || "Módulo Indefinido"}</h2>
                           <p className="text-xs text-on-surface-variant font-medium mt-1">Arrastra para reordenar. Haz clic en las etiquetas de acceso para cambiar entre Gratis o Premium.</p>
                        </div>
                     </div>

                     <div className="flex flex-col gap-3">
                        {contentItems.map((item, index) => (
                           <div 
                              key={item.id}
                              draggable
                              onDragStart={(e) => onDragStart(e, index)}
                              onDragEnter={(e) => onDragEnter(e, index)}
                              onDragOver={(e) => e.preventDefault()}
                              onDragEnd={onDrop}
                              className={`group bg-surface border border-outline-variant/20 hover:border-primary/50 relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-2xl shadow-sm transition-all cursor-move ${draggedIdx === index ? 'opacity-50' : 'opacity-100'}`}
                           >
                              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0 flex-1">
                                 <span className="material-symbols-outlined text-outline-variant drag-handle cursor-grab active:cursor-grabbing shrink-0">drag_indicator</span>
                                 
                                 {/* Icono de Plataforma */}
                                 <div className={`w-14 sm:w-16 h-10 rounded overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative ${item.platform === 'vimeo' ? 'bg-indigo-600' : item.platform === 'youtube' ? 'bg-red-600' : 'bg-orange-600'}`}>
                                    {item.type === 'VIDEO' ? (
                                       <span className="material-symbols-outlined text-white text-[16px]">play_arrow</span>
                                    ) : (
                                       <span className="material-symbols-outlined text-white text-[20px]">picture_as_pdf</span>
                                    )}
                                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] font-black px-1 rounded uppercase">{item.platform}</span>
                                 </div>
                                 
                                 <div className="min-w-0 pr-2 flex-1">
                                    <h4 className="font-bold text-sm text-on-surface flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                       <span className="truncate">{index + 1}. {item.title}</span>
                                       {item.secure && (
                                          <span className="bg-surface-container-high text-on-surface-variant text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wide border border-outline-variant/20 shrink-0">Anti-Descarga</span>
                                       )}
                                    </h4>
                                    <p className="text-xs text-on-surface-variant mt-0.5 truncate">{item.time} • {item.date}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-outline-variant/10 sm:border-0 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                                 {/* Access Badge */}
                                 <button onClick={() => toggleAccess(item.id)} className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                                       item.access === "Muestra Gratis" ? "text-green-600 bg-green-500/10 hover:bg-green-500/20" : 
                                       item.access === "Premium" ? "text-amber-600 bg-amber-500/10 hover:bg-amber-500/20" : 
                                       "text-purple-600 bg-purple-500/10 hover:bg-purple-500/20"
                                    }`}>
                                       {item.access === "Premium" && <span className="material-symbols-outlined text-[10px]">lock</span>}
                                       {item.access === "Pago Especial" && <span className="material-symbols-outlined text-[10px]">lock_person</span>}
                                       {item.access}
                                    </span>
                                 </button>
                                 <div className="flex items-center gap-1">
                                    <button onClick={() => { setEditMaterialId(item.id); setMaterialInput({title: item.title, type: item.type, platform: item.platform || 'youtube', access: item.access, description: "", price: "", video_url: item.url, media_url: item.url}); setIsMaterialModalOpen(true); }} className="text-outline-variant hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-surface-container" title="Editar">
                                       <span className="material-symbols-outlined text-[16px] sm:text-[18px]">edit</span>
                                    </button>

                                    <button onClick={() => toggleItemActive(item.id, item.is_active)} className="text-outline-variant hover:text-green-500 transition-colors p-2 rounded-full hover:bg-surface-container" title={item.is_active ? "Ocultar" : "Mostrar"}>
                                       <span className={`material-symbols-outlined text-[16px] sm:text-[18px] ${item.is_active ? 'text-green-500' : ''}`}>
                                          {item.is_active ? 'visibility' : 'visibility_off'}
                                       </span>
                                    </button>
                                    
                                    <button onClick={() => deleteItem(item.id)} className="text-outline-variant hover:text-red-500 transition-colors p-2 rounded-full hover:bg-surface-container" title="Eliminar">
                                       <span className="material-symbols-outlined text-[16px] sm:text-[18px]">delete</span>
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="mt-8 border-t border-outline-variant/10 pt-6">
                        <p className="text-xs text-on-surface-variant bg-surface-container-high border border-outline-variant/20 p-3 rounded-lg flex gap-2">
                           <span className="material-symbols-outlined text-primary text-[16px] shrink-0">info</span>
                           <span>Los PDFs subidos aquí utilizan el nuevo visor web seguro de Koomun. Tienen las opciones de impresión y descarga extraídas del código para proteger tu propiedad intelectual, y son monetizables vía <Link href="/upgrade" className="text-primary font-bold hover:underline">Desbloqueo Único</Link>.</span>
                        </p>
                     </div>
                  </div>
               </div>
             </div>
          )}

          {/* TAB 2: AUDIENCIA */}

          {activeTab === "audiencia" && (
             <div className="animate-in fade-in duration-500">
               <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
                  <div className="flex-1 w-full relative">
                     <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                     <input type="text" placeholder="Buscar mimebro por nombre o email..." className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary rounded-full pl-12 pr-6 py-3 text-sm text-on-surface outline-none shadow-sm" />
                  </div>
                  <div className="flex gap-2">
                     <button className="px-4 py-2 border border-outline-variant/20 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-surface-container-low">
                        <span className="material-symbols-outlined text-[16px]">filter_list</span> Filtrar
                     </button>
                     <button className="px-4 py-2 border border-outline-variant/20 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-surface-container-low">
                        <span className="material-symbols-outlined text-[16px]">download</span> Exportar CSV
                     </button>
                  </div>
               </div>

               <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider border-b border-outline-variant/10">
                           <th className="p-6 font-bold">Usuario</th>
                           <th className="p-6 font-bold">Registro</th>
                           <th className="p-6 font-bold">Estado</th>
                           <th className="p-6 font-bold">Valor (LTV)</th>
                           <th className="p-6 font-bold text-center">Acciones</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-outline-variant/10">
                        {audience.map((user) => (
                           <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                              <td className="p-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                                       <img src={`https://i.pravatar.cc/150?u=${user.id}a`} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                       <p className="font-bold text-sm text-on-surface">{user.name}</p>
                                       <p className="text-xs text-on-surface-variant">{user.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-6 text-sm text-on-surface-variant">{user.date}</td>
                              <td className="p-6">
                                 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${user.status === 'Premium' ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'}`}>
                                    {user.status}
                                 </span>
                              </td>
                              <td className="p-6 font-bold text-sm text-on-surface">{user.rev}</td>
                              <td className="p-6 text-center">
                                 <button className="p-2 hover:bg-outline-variant/10 rounded-full text-outline-variant transition-colors" title="Gestionar Usuario">
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  <div className="p-4 border-t border-outline-variant/10 flex justify-center">
                     <button className="text-primary font-bold text-sm hover:underline">Ver los 3,402 miembros</button>
                  </div>
               </div>
             </div>
          )}

          {/* TAB 3: FINANZAS */}
          {activeTab === "finanzas" && (
             <div className="animate-in fade-in duration-500">
                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
                   <div>
                      <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ingreso Mensual Recurrente (MRR)</h2>
                      <div className="flex items-end gap-4">
                         <span className="text-5xl font-black text-on-surface">$2,840.50</span>
                         <span className="text-green-500 font-bold mb-1 flex items-center text-sm"><span className="material-symbols-outlined text-[16px]">trending_up</span> 14% vs último mes</span>
                      </div>
                   </div>
                   <button className="px-8 py-4 bg-on-surface text-surface font-black rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-95">
                      Retirar Fondos
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 shadow-sm">
                      <h3 className="font-bold text-lg text-on-surface mb-6">Próximos Pagos de Stripe</h3>
                      <div className="flex items-center justify-between border-b border-outline-variant/10 py-4">
                         <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500 bg-green-500/10 p-2 rounded-lg">input</span>
                            <div>
                               <p className="font-bold text-sm text-on-surface">Payout Programado</p>
                               <p className="text-xs text-on-surface-variant">Llega en 2 días hábiles</p>
                            </div>
                         </div>
                         <span className="font-black text-on-surface">$1,420.00</span>
                      </div>
                      <div className="flex items-center justify-between py-4">
                         <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-outline-variant bg-surface-container-high p-2 rounded-lg">schedule</span>
                            <div>
                               <p className="font-bold text-sm text-on-surface">En proceso (Rolling Reserve)</p>
                               <p className="text-xs text-on-surface-variant">Disponible el 28 Mar</p>
                            </div>
                         </div>
                         <span className="font-black text-on-surface-variant">$420.50</span>
                      </div>
                   </div>

                   <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                      <span className="material-symbols-outlined text-5xl text-amber-500 mb-4">diamond</span>
                      <h3 className="font-bold text-lg text-on-surface mb-2">Suscripciones Activas</h3>
                      <p className="text-4xl font-black text-on-surface mb-2">98</p>
                      <p className="text-sm text-on-surface-variant">Usuarios Premium en SaaS Builders Elite.</p>
                   </div>
                </div>
             </div>
          )}

          {/* TAB 4: AJUSTES */}
          {activeTab === "ajustes" && (
             <div className="animate-in fade-in duration-500 max-w-3xl">
                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 shadow-sm mb-6">
                   <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/10">
                      <span className="material-symbols-outlined text-3xl text-primary">account_balance_wallet</span>
                      <div>
                         <h3 className="font-bold text-lg text-on-surface">Cuentas y Pagos</h3>
                         <p className="text-sm text-on-surface-variant">Gestiona cómo recibes tu dinero.</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between p-4 border border-outline-variant/20 rounded-xl mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-[#635BFF] rounded flex items-center justify-center text-white font-black text-xs">str</div>
                         <div>
                            <p className="font-bold text-sm text-on-surface">Stripe Connect</p>
                            <p className="text-xs text-green-500 font-bold">Conectado (Recibiendo pagos)</p>
                         </div>
                      </div>
                      <button className="text-xs font-bold text-outline-variant hover:text-on-surface">Cambiar Cuenta</button>
                   </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                   <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/10">
                      <span className="material-symbols-outlined text-3xl text-outline-variant">public</span>
                      <div>
                         <h3 className="font-bold text-lg text-on-surface">Enlace de tu Comunidad (URL)</h3>
                         <p className="text-sm text-on-surface-variant">Define el link de invitación público bajo la red global Koomun.</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="border border-outline-variant/20 bg-surface-container-low rounded-2xl p-6 relative group overflow-hidden opacity-70">
                         <div className="absolute top-4 right-4 text-primary">
                             <span className="material-symbols-outlined">radio_button_checked</span>
                         </div>
                         <h4 className="font-bold text-sm text-on-surface mb-2">Slug Protegido (PREMIUM)</h4>
                         <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">Koomun genera un ID único cifrado tras el nombre sugerido para evitar colisiones globales sin costo.</p>
                         <div className="bg-surface-container-highest px-3 py-2.5 rounded-lg border-2 border-primary/20 flex gap-1 items-center font-mono">
                            <span className="text-xs text-on-surface-variant font-medium">koomun.com/c/</span>
                            <span className="text-xs text-on-surface font-bold">saas-j9f12</span>
                         </div>
                      </div>

                      <div className="border border-outline-variant/20 bg-surface-container-lowest hover:border-amber-500/50 rounded-2xl p-6 relative transition-colors group cursor-pointer">
                         <div className="absolute top-4 right-4 text-outline-variant/50 group-hover:text-amber-500 transition-colors">
                             <span className="material-symbols-outlined">radio_button_unchecked</span>
                         </div>
                         <div className="absolute -top-3 left-6">
                            <span className="bg-amber-500 text-amber-950 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-md">Plan ELITE</span>
                         </div>
                         <h4 className="font-bold text-sm text-on-surface mb-2 mt-1">Slug Absoluto / Branding Pura</h4>
                         <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">Reserva tu alias universal y remueve todos los identificadores. Crea la experiencia más premium posible.</p>
                         <div className="bg-surface-container-high px-3 py-2.5 rounded-lg border border-outline-variant/30 flex gap-1 items-center font-mono focus-within:border-amber-500/50 transition-colors">
                            <span className="text-xs text-on-surface-variant font-medium">koomun.com/c/</span>
                            <input disabled placeholder="tunombre" className="bg-transparent text-xs text-on-surface font-bold outline-none w-full placeholder-on-surface-variant/50" />
                         </div>
                      </div>
                   </div>

                   <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-5 flex items-start gap-4 mb-4">
                      <span className="material-symbols-outlined text-amber-600 mt-1">info</span>
                      <div>
                         <h4 className="text-sm font-bold text-amber-800 mb-1">Aviso sobre dominios propios (.com / .net)</h4>
                         <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                           No es posible apuntar un dominio externo DNS (ej. <strong>www.mi-landing.com</strong>) directamente. Para mantener la latencia a nivel global y el ancho de banda ultra-rápido de video, Koomun retiene la infraestructura de su Dominio Raíz y tú gestionas tu Sub-Directorio oficial.
                         </p>
                      </div>
                   </div>
                   
                   <div className="flex justify-end pt-4 border-t border-outline-variant/10">
                      <Link href="/upgrade">
                         <button className="px-6 py-3 bg-amber-500 text-amber-950 text-sm font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-2">
                            Actualizar a ELITE <span className="material-symbols-outlined text-[18px]">verified</span>
                         </button>
                      </Link>
                   </div>
                </div>
             </div>
          )}

          {/* TAB 5: EVENTOS */}
          {activeTab === "eventos" && (
            <div className="animate-in fade-in duration-500">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-on-surface mb-2 tracking-tight">Gestor de Eventos</h2>
                    <p className="text-on-surface-variant text-sm">Crea eventos físicos o virtuales (Zoom/Meet) para tu comunidad o perfil de creador.</p>
                  </div>
                  <button 
                    onClick={() => {
                        if (!isElite) {
                            setShowUpgradeModal(true);
                        } else {
                            setIsEventModalOpen(true);
                        }
                    }} 
                    className="bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-2.5 rounded-full font-black text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-transform hover:scale-105"
                    title="Esta función es exclusiva para Creadores Elite."
                  >
                     <span className="material-symbols-outlined text-[16px]">lock</span>
                     Crear Evento (Elite)
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventsList.map((event) => (
                    <div key={event.id} className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all flex flex-col w-full overflow-hidden">
                       <div className="flex justify-between items-start mb-4 gap-2">
                          <span className={`${event.type === 'Presencial' ? 'bg-orange-500/10 text-orange-600' : 'bg-blue-500/10 text-blue-600'} px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1 shrink-0`}>
                             <span className="material-symbols-outlined text-[12px] sm:text-[14px]">
                               {event.type === 'Presencial' ? 'location_on' : 'videocam'}
                             </span> 
                             {event.type}
                          </span>
                          <button className="text-outline-variant hover:text-on-surface shrink-0"><span className="material-symbols-outlined">more_vert</span></button>
                       </div>
                       <h3 className="font-extrabold text-xl text-on-surface mb-2">{event.title}</h3>
                       <p className="text-sm text-on-surface-variant mb-4 flex-1">{event.description}</p>
                       
                       <div className="space-y-3 mb-6 bg-surface-container-high/30 p-4 rounded-2xl">
                          <div className="flex items-center gap-3 text-sm font-bold text-on-surface">
                             <span className={`material-symbols-outlined text-[18px] ${event.type === 'Presencial' ? 'text-orange-500' : 'text-primary'}`}>calendar_today</span>
                             {event.date}
                          </div>
                          <div className="flex items-center gap-3 text-sm font-bold text-on-surface">
                             <span className={`material-symbols-outlined text-[18px] ${event.type === 'Presencial' ? 'text-orange-500' : 'text-primary'}`}>schedule</span>
                             {event.time}
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap items-center justify-between border-t border-outline-variant/10 pt-4 gap-3">
                          <span className="text-[11px] sm:text-xs font-extrabold text-on-surface flex items-center gap-1 whitespace-nowrap"><span className="material-symbols-outlined text-[14px]">group</span> {event.registered} Inscritos</span>
                          <span className="text-[10px] sm:text-xs font-black text-primary bg-primary/10 px-2 py-1.5 rounded uppercase tracking-wider truncate max-w-[140px] text-center">{event.visibility}</span>
                       </div>
                       {event.link && (
                          <a href={event.link} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-1.5 w-full bg-blue-500/10 text-blue-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-colors">
                             <span className="material-symbols-outlined text-[14px]">link</span>
                             Enlace de Ingreso
                          </a>
                       )}
                       
                       {event.location && (
                          <div className="mt-4 flex items-center justify-center gap-1.5 w-full bg-orange-500/10 text-orange-600 px-3 py-2 rounded-xl text-xs font-bold">
                             <span className="material-symbols-outlined text-[14px]">map</span>
                             <span className="truncate">{event.location}</span>
                          </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>
          )}

        </div>
        {/* Add Modals Here globally outside layout */}
        {dialogState.isOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
               <div className="bg-surface-container-lowest w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-outline-variant/20 flex flex-col">
                  <h3 className="text-xl font-bold text-on-surface mb-2">{dialogState.title}</h3>
                  <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">{dialogState.message}</p>
                  <div className="flex justify-end gap-3 mt-auto">
                     {dialogState.type === 'confirm' && (
                        <button 
                           onClick={() => setDialogState({ ...dialogState, isOpen: false, onConfirm: undefined })} 
                           className="px-5 py-2.5 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
                        >
                           Cancelar
                        </button>
                     )}
                     <button 
                        onClick={() => {
                           if (dialogState.type === 'confirm' && dialogState.onConfirm) dialogState.onConfirm();
                           setDialogState({ ...dialogState, isOpen: false, onConfirm: undefined });
                        }} 
                        className={`px-5 py-2.5 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all ${dialogState.type === 'confirm' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-container'}`}
                     >
                        {dialogState.type === 'confirm' ? 'Continuar' : 'Aceptar'}
                     </button>
                  </div>
               </div>
            </div>
         )}
        {isModuleModalOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 shadow-2xl border border-outline-variant/20">
                  <h3 className="text-xl font-bold text-on-surface mb-2">{editModuleId ? "Editar Módulo" : "Nuevo Módulo"}</h3>
                 <p className="text-sm text-on-surface-variant mb-6">Agrupa tus lecciones en diferentes categorías (ej: Bienvenida, Semana 1, Conceptos base).</p>
                 
                 <label className="block text-xs font-bold text-on-surface mb-2">Nombre del Módulo</label>
                 <input 
                    type="text" 
                    placeholder="Ej. Semana 1: Fundamentos" 
                    value={moduleInputName}
                    onChange={(e) => setModuleInputName(e.target.value)}
                    className="w-full bg-surface-container-high border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-colors mb-4"
                    autoFocus
                 />

                 <label className="block text-xs font-bold text-on-surface mb-2">Descripción Corta</label>
                 <textarea 
                    rows={3}
                    placeholder="Describe de qué trata este módulo..." 
                    value={moduleInputDesc}
                    onChange={(e) => setModuleInputDesc(e.target.value)}
                    className="w-full bg-surface-container-high border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-colors mb-4 resize-none text-sm"
                 ></textarea>

                 <div className="mb-6">
                    <label className="block text-xs font-bold text-on-surface mb-2">Imagen de Portada del Módulo (Obligatoria)</label>
                    {moduleImageUrl ? (
                       <div className="relative w-full h-32 rounded-xl overflow-hidden border border-outline-variant/20 group">
                          <img src={moduleImageUrl} alt="Cover" className="w-full h-full object-cover" />
                          <button onClick={() => setModuleImageUrl("")} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="material-symbols-outlined">delete</span>
                          </button>
                       </div>
                    ) : (
                       <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-outline-variant/30 rounded-xl cursor-pointer hover:bg-surface-container-high hover:border-primary transition-colors">
                          <span className="material-symbols-outlined text-outline-variant/50 mb-1 text-3xl">add_photo_alternate</span>
                          <span className="text-xs text-on-surface-variant font-medium">
                             {uploadingModuleImage ? "Subiendo..." : "Click para subir imagen"}
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleUploadModuleImage} disabled={uploadingModuleImage} />
                       </label>
                    )}
                 </div>
                 
                 <div className="flex justify-end gap-3">
                    <button onClick={() => { setIsModuleModalOpen(false); setEditModuleId(null); setModuleInputName(""); setModuleInputDesc(""); setModuleImageUrl(""); }} className="px-5 py-2.5 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">Cancelar</button>
                    <button onClick={handleCreateModule} className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-container shadow-md active:scale-95 transition-all">{editModuleId ? "Guardar Cambios" : "Crear Módulo"}</button>
                 </div>
              </div>
           </div>
        )}

        {isMaterialModalOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 py-8 animate-in fade-in">
              <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-outline-variant/20 max-h-full overflow-y-auto no-scrollbar">
                 <h3 className="text-xl font-bold text-on-surface mb-2">{editMaterialId ? "Editar Material" : "Añadir Nuevo Material"}</h3>
                 <p className="text-sm text-on-surface-variant mb-6">Sube un video o un PDF interactivo para el módulo <strong className="text-primary">{moduleNames.find((m: any) => m.id === activeModuleId)?.name || "Seleccionado"}</strong>.</p>
                 
                 <div className="flex flex-col gap-5">
                    <div>
                       <label className="block text-xs font-bold text-on-surface mb-1">Título de la Lección / Archivo</label>
                       <input 
                          type="text" 
                          placeholder="Ej. Análisis de Mercado Q3" 
                          value={materialInput.title}
                          onChange={(e) => setMaterialInput({...materialInput, title: e.target.value})}
                          className="w-full bg-surface-container-high border border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-colors"
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-on-surface mb-1">Formato</label>
                          <select 
                            value={materialInput.type}
                            onChange={(e) => setMaterialInput({...materialInput, type: e.target.value})}
                            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface outline-none appearance-none"
                          >
                             <option value="VIDEO">Video Embed</option>
                             <option value="NATIVE">Video Nativo (Koomun Stream)</option>
                             <option value="PDF">Documento Seguro PDF</option>
                          </select>
                       </div>
                       
                       {materialInput.type === "VIDEO" && (
                          <div>
                             <label className="block text-xs font-bold text-on-surface mb-1">Proveedor de Video</label>
                             <select 
                               value={materialInput.platform}
                               onChange={(e) => setMaterialInput({...materialInput, platform: e.target.value})}
                               className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface outline-none appearance-none"
                             >
                                <option value="youtube">YouTube</option>
                                <option value="vimeo">Vimeo</option>
                             </select>
                          </div>
                       )}
                    </div>

                                        {/* Contenido / Url Upload */}
                    {materialInput.type === "VIDEO" && (
                       <div className="animate-in fade-in slide-in-from-top-2">
                          <label className="block text-xs font-bold text-on-surface mb-1">Enlace del Video (URL)</label>
                          <input 
                             type="url" 
                             placeholder="Ej. https://youtube.com/watch?v=..." 
                             value={materialInput.video_url}
                             onChange={(e) => setMaterialInput({...materialInput, video_url: e.target.value})}
                             className="w-full bg-surface-container-high border border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-colors"
                          />
                       </div>
                    )}
                    
                    {materialInput.type === "PDF" && (
                       <div className="animate-in fade-in slide-in-from-top-2">
                          <label className="block text-xs font-bold text-on-surface mb-1">Archivo Documento Segurizado</label>
                          <div className="w-full bg-surface-container-high border-2 border-dashed border-outline-variant/50 hover:border-primary rounded-xl px-4 py-6 flex flex-col items-center justify-center transition-colors cursor-pointer relative overflow-hidden group">
                             <input type="file" accept=".pdf" onChange={handleUploadMaterialFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" />
                             <span className="material-symbols-outlined text-3xl text-outline-variant group-hover:text-primary mb-2 transition-colors">
                                {uploadingMaterialFile ? 'refresh' : 'picture_as_pdf'}
                             </span>
                             <span className="text-sm font-bold text-on-surface">
                                {uploadingMaterialFile ? 'Subiendo Documento...' : materialInput.media_url ? 'Archivo Subido (Click para reemplazar)' : 'Haz click o arrastra tu PDF'}
                             </span>
                          </div>
                          {materialInput.media_url && !uploadingMaterialFile && <p className="text-green-600 text-xs mt-2 font-bold break-all flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span> Documento cargado exitosamente.</p>}
                       </div>
                    )}

                    {/* LIMITATION ALERTS */}
                    {materialInput.type === "NATIVE" && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4">
                           <span className="material-symbols-outlined text-amber-500">upload_file</span>
                           <div>
                              <p className="text-sm font-bold text-amber-600 mb-1">Hosting Privado Bloqueado</p>
                              <p className="text-xs text-on-surface-variant font-medium mb-3">La subida de MP4 directos requiere recursos de procesamiento. Esta función es exclusiva para Creadores ELITE.</p>
                              <Link href="/upgrade">
                                 <button className="px-5 py-2 bg-amber-500 text-amber-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors shadow-lg active:scale-95">Mejorar Plan a ELITE</button>
                              </Link>
                           </div>
                        </div>
                    )}
                    
                    {materialInput.type === "PDF" && hasPDFUploaded && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4">
                           <span className="material-symbols-outlined text-amber-500">lock</span>
                           <div>
                              <p className="text-sm font-bold text-amber-600 mb-1">Límite de Documentos Alcanzado</p>
                              <p className="text-xs text-on-surface-variant font-medium mb-3">El Plan PREMIUM incluye 1 documento de prueba que actualmente ya estás usando. Adquiere el Plan ELITE para hospedar PDFs y descargables ILIMITADOS protegidos con anti-copia.</p>
                              <Link href="/upgrade">
                                 <button className="px-5 py-2 bg-amber-500 text-amber-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors shadow-lg active:scale-95">Mejorar Plan a ELITE</button>
                              </Link>
                           </div>
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-3">
                       <div>
                          <label className="block text-xs font-bold text-on-surface mb-1">Nivel de Acceso</label>
                          <div className="flex gap-2 p-1 bg-surface-container-highest rounded-xl">
                             {["Muestra Gratis", "Premium", "Pago Especial"].map(level => (
                                <button 
                                  key={level}
                                  onClick={() => setMaterialInput({...materialInput, access: level})}
                                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${materialInput.access === level ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low"}`}
                                >
                                   {level}
                                </button>
                             ))}
                          </div>
                       </div>
                       
                       {materialInput.access === "Pago Especial" && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                             <label className="block text-xs font-bold text-on-surface mb-1">Precio Individual (USD)</label>
                             <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                                <input 
                                   type="number" 
                                   placeholder="15.00" 
                                   value={materialInput.price}
                                   onChange={(e) => setMaterialInput({...materialInput, price: e.target.value})}
                                   className="w-full bg-surface-container-high border border-outline-variant/20 focus:border-primary rounded-xl pl-8 pr-4 py-3 text-on-surface outline-none transition-colors"
                                />
                             </div>
                             <p className="text-[10px] text-on-surface-variant mt-1.5 font-medium">Los usuarios deberán pagar este monto exacto para desbloquear este material específico, independiente de su plan.</p>
                          </div>
                       )}
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-on-surface mb-2">Contenido / Descripción</label>
                       <div className="border border-outline-variant/20 rounded-xl overflow-hidden focus-within:border-primary transition-colors">
                          <div className="bg-surface-container-high border-b border-outline-variant/20 px-3 py-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
                             <button className="p-1.5 hover:bg-surface-container-lowest rounded text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center" title="Negrita">
                                <span className="material-symbols-outlined text-[16px]">format_bold</span>
                             </button>
                             <button className="p-1.5 hover:bg-surface-container-lowest rounded text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center" title="Cursiva">
                                <span className="material-symbols-outlined text-[16px]">format_italic</span>
                             </button>
                             <button className="p-1.5 hover:bg-surface-container-lowest rounded text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center" title="Subrayado">
                                <span className="material-symbols-outlined text-[16px]">format_underlined</span>
                             </button>
                             <div className="w-px h-4 bg-outline-variant/30 mx-1"></div>
                             <button className="p-1.5 hover:bg-surface-container-lowest rounded text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center" title="Lista">
                                <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                             </button>
                             <button className="p-1.5 hover:bg-surface-container-lowest rounded text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center" title="Enlace">
                                <span className="material-symbols-outlined text-[16px]">link</span>
                             </button>
                             <button className="p-1.5 hover:bg-surface-container-lowest rounded text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center" title="Imagen">
                                <span className="material-symbols-outlined text-[16px]">image</span>
                             </button>
                             <button className="p-1.5 hover:bg-surface-container-lowest rounded text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center" title="Código">
                                <span className="material-symbols-outlined text-[16px]">code</span>
                             </button>
                          </div>
                          <textarea 
                             rows={4}
                             placeholder="Escribe el contexto, enlaces adicionales o descripción de este material..."
                             value={materialInput.description}
                             onChange={(e) => setMaterialInput({...materialInput, description: e.target.value})}
                             className="w-full bg-surface-container-lowest p-4 text-sm text-on-surface outline-none resize-y min-h-[120px]"
                          ></textarea>
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-4 border-t border-outline-variant/10 flex justify-end gap-3">
                    <button onClick={() => { setIsMaterialModalOpen(false); setEditMaterialId(null); setMaterialInput({ title: "", type: "VIDEO", platform: "youtube", access: "Muestra Gratis", description: "", price: "", video_url: "", media_url: "" }); }} className="px-5 py-2.5 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">Cancelar</button>
                    <button 
                       onClick={handleCreateMaterial} 
                       disabled={materialInput.type === "NATIVE" || (materialInput.type === "PDF" && hasPDFUploaded) || uploadingMaterialFile || (materialInput.type === 'VIDEO' && !materialInput.video_url) || (materialInput.type === 'PDF' && !materialInput.media_url)}
                       className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 transition-all flex items-center gap-2"
                    >
                       <span className="material-symbols-outlined text-[16px]">cloud_upload</span> {editMaterialId ? "Guardar Cambios" : "Cargar a Módulo"}
                    </button>
                 </div>
              </div>
           </div>
        )}

         {isEventModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-surface w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-outline-variant/20 flex flex-col">
                  
                  <div className="px-6 py-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
                     <h2 className="text-xl font-black text-on-surface tracking-tight">Crear Nuevo Evento</h2>
                     <button onClick={() => setIsEventModalOpen(false)} className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                     </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto no-scrollbar max-h-[70vh]">
                     
                     <div className="mb-6">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Título del Evento</label>
                        <input 
                           type="text" 
                           placeholder="Ej. Sesión Q&A" 
                           value={eventInput.title}
                           onChange={e => setEventInput({...eventInput, title: e.target.value})}
                           className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary outline-none text-on-surface"
                        />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                           <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Tipo de Evento</label>
                           <select 
                              value={eventInput.type}
                              onChange={e => setEventInput({...eventInput, type: e.target.value})}
                              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary outline-none text-on-surface appearance-none"
                           >
                              <option value="Virtual (Zoom)">Virtual (Zoom)</option>
                              <option value="Virtual (Meet)">Virtual (Meet)</option>
                              <option value="Presencial">Presencial</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Visibilidad</label>
                           <select 
                              value={eventInput.visibility}
                              onChange={e => setEventInput({...eventInput, visibility: e.target.value})}
                              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary outline-none text-on-surface appearance-none"
                           >
                              <option value="Público (Perfil)">Público (Perfil)</option>
                              <option value="Privado (Solo Link)">Privado</option>
                              <option value="SaaS Builders (Com)">SaaS Builders</option>
                           </select>
                        </div>
                     </div>
                     
                     <div className="mb-6">
                        {(eventInput.type === 'Virtual (Zoom)' || eventInput.type === 'Virtual (Meet)') ? (
                           <div className="animate-in fade-in zoom-in-95 duration-200">
                              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-blue-500">link</span> Enlace del Evento</label>
                              <input 
                                 type="url" 
                                 placeholder="https://zoom.us/j/123456789" 
                                 value={eventInput.link}
                                 onChange={e => setEventInput({...eventInput, link: e.target.value})}
                                 className="w-full bg-surface-container-lowest border border-blue-500/30 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none text-on-surface"
                              />
                           </div>
                        ) : (
                           <div className="animate-in fade-in zoom-in-95 duration-200">
                              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-orange-500">location_on</span> Dirección Física</label>
                              <input 
                                 type="text" 
                                 placeholder="Ej. WeWork Reforma, Piso 12, Ciudad de México" 
                                 value={eventInput.location}
                                 onChange={e => setEventInput({...eventInput, location: e.target.value})}
                                 className="w-full bg-surface-container-lowest border border-orange-500/30 rounded-xl px-4 py-3 text-sm font-medium focus:border-orange-500 outline-none text-on-surface"
                              />
                           </div>
                        )}
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                           <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Fecha</label>
                           <input 
                              type="text" 
                              placeholder="Ej. 10 Nov 2026"
                              value={eventInput.date}
                              onChange={e => setEventInput({...eventInput, date: e.target.value})}
                              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary outline-none text-on-surface"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Hora</label>
                           <input 
                              type="text" 
                              placeholder="Ej. 18:00 (GMT-5)" 
                              value={eventInput.time}
                              onChange={e => setEventInput({...eventInput, time: e.target.value})}
                              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary outline-none text-on-surface"
                           />
                        </div>
                     </div>
                     
                     <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Descripción</label>
                        <textarea 
                           rows={3}
                           placeholder="De qué tratará el evento, agenda, etc..." 
                           value={eventInput.description}
                           onChange={e => setEventInput({...eventInput, description: e.target.value})}
                           className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary outline-none text-on-surface resize-none"
                        ></textarea>
                     </div>

                  </div>
                  
                  <div className="p-4 md:p-6 bg-surface-container-lowest border-t border-outline-variant/10 flex justify-end gap-3">
                     <button onClick={() => setIsEventModalOpen(false)} className="px-6 py-2.5 bg-surface-container rounded-full text-sm font-bold hover:bg-surface-container-high transition-colors text-on-surface">Cancelar</button>
                     <button onClick={handleCreateEvent} className="px-6 py-2.5 bg-primary text-white font-bold text-sm tracking-wide rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">publish</span>
                        Publicar Evento
                     </button>
                  </div>
               </div>
            </div>
         )}

         {isHelpModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
               <div className="bg-surface-container-lowest w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl border border-outline-variant/20 flex flex-col overflow-hidden">
                  
                  {/* Header Sticky */}
                  <div className="p-6 md:p-8 flex justify-between items-center bg-surface-container-lowest border-b border-outline-variant/10 z-10 shadow-sm relative overflow-hidden">
                     <div className="flex items-center gap-4 text-on-surface relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline-variant/10 flex items-center justify-center shrink-0 shadow-sm">
                           <span className="material-symbols-outlined text-4xl text-primary">lightbulb</span>
                        </div>
                        <div>
                           <h2 className="text-3xl font-black tracking-tight">Guía Maestra del Studio</h2>
                           <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Aprende a dominar Koomun 100%</p>
                        </div>
                     </div>
                     <button onClick={() => setIsHelpModalOpen(false)} className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface flex items-center justify-center shrink-0 relative z-10">
                        <span className="material-symbols-outlined">close</span>
                     </button>
                  </div>

                  {/* Body Scrollable */}
                  <div className="p-6 md:p-8 overflow-y-auto no-scrollbar space-y-8 bg-surface">
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
                           <div className="flex items-center gap-3 mb-4 text-on-surface bg-surface-container w-fit px-4 py-2 rounded-xl">
                              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">badge</span>
                              <h3 className="font-extrabold text-sm uppercase tracking-widest text-primary">Perfil Creador</h3>
                           </div>
                           <p className="text-sm text-on-surface-variant leading-relaxed">
                              Tu identidad global multiplataforma. Configura aquí tu foto Elite y biografía. Tus comunidades se listarán bajo este paraguas para que tu audiencia te descubra fácilmente.
                           </p>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
                           <div className="flex items-center gap-3 mb-4 text-on-surface bg-surface-container w-fit px-4 py-2 rounded-xl">
                              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">web</span>
                              <h3 className="font-extrabold text-sm uppercase tracking-widest text-primary">Landing Privada</h3>
                           </div>
                           <p className="text-sm text-on-surface-variant leading-relaxed">
                              El embudo de ventas de tu ecosistema. Personaliza la portada, precios (mensual/anual) y promesas para cada comunidad individualmente.
                           </p>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
                           <div className="flex items-center gap-3 mb-4 text-on-surface bg-surface-container w-fit px-4 py-2 rounded-xl">
                              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">apps</span>
                              <h3 className="font-extrabold text-sm uppercase tracking-widest text-primary">Tus Comunidades</h3>
                           </div>
                           <p className="text-sm text-on-surface-variant leading-relaxed">
                              Crea infinitas comunidades. Si tienes una comunidad gratis ("Principiantes") y una VIP ($99), aquí gestionas ambas desde una vista de pájaro y mides sus MRR individuales.
                           </p>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
                           <div className="flex items-center gap-3 mb-4 text-on-surface bg-surface-container w-fit px-4 py-2 rounded-xl">
                              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">video_library</span>
                              <h3 className="font-extrabold text-sm uppercase tracking-widest text-primary">Contenido Modular</h3>
                           </div>
                           <p className="text-sm text-on-surface-variant leading-relaxed">
                              Control total con Drag & Drop. Crea "Módulos" y arrastra PDFs o videos. Controla quién ve qué (Ej: Módulo 1 disponible gratis, Módulo 2 exclusivo para subs de la bóveda paga).
                           </p>
                        </div>
                        
                        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
                           <div className="flex items-center gap-3 mb-4 text-on-surface bg-surface-container w-fit px-4 py-2 rounded-xl">
                              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">calendar_month</span>
                              <h3 className="font-extrabold text-sm uppercase tracking-widest text-primary">Gestor Eventos</h3>
                           </div>
                           <p className="text-sm text-on-surface-variant leading-relaxed">
                              Agenda automatizada. Crea eventos (Zoom o presenciales) que aparecerán tanto en tu Perfil Global como inyectados directamente dentro del feed privado de tus comunidades elegidas.
                           </p>
                        </div>
                        
                        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
                           <div className="flex items-center gap-3 mb-4 text-on-surface bg-surface-container w-fit px-4 py-2 rounded-xl">
                              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">group</span>
                              <h3 className="font-extrabold text-sm uppercase tracking-widest text-primary">Base de Audiencia</h3>
                           </div>
                           <p className="text-sm text-on-surface-variant leading-relaxed">
                              Tu capital. Monitorea y segmenta por nivel de compromiso, aplica notificaciones push personalizadas y expulsa o premia usuarios. Ej: Envía un descuento de 30% a los que llevan inactivos más de 10 días.
                           </p>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
                           <div className="flex items-center gap-3 mb-4 text-on-surface bg-surface-container w-fit px-4 py-2 rounded-xl">
                              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">monitoring</span>
                              <h3 className="font-extrabold text-sm uppercase tracking-widest text-primary">Motor Financiero</h3>
                           </div>
                           <p className="text-sm text-on-surface-variant leading-relaxed">
                              Integrado nativamente con Stripe Connect. Ingresa tu cuenta bancaria y recauda en automático. Mide Churn, MRR y gestiona devoluciones de transferencias fallidas en tiempo real.
                           </p>
                        </div>
                        
                        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all md:col-span-2 flex flex-col justify-center group">
                           <div className="flex items-center gap-3 mb-4 text-on-surface bg-amber-500/10 w-fit px-4 py-2 rounded-xl border border-amber-500/20">
                              <span className="material-symbols-outlined text-amber-500 group-hover:scale-110 transition-transform">tune</span>
                              <h3 className="font-extrabold text-sm uppercase tracking-widest text-amber-600">Premium: API, Webhooks & Perfil Elite</h3>
                           </div>
                           <p className="text-sm text-on-surface-variant leading-relaxed max-w-3xl">
                              Ajustes avanzados para verdaderas empresas e integraciones pesadas. Inyecta mensajes de notificación general en canales de Slack/Discord a través de webhooks. Da acceso granular solo-lectura a editores y consigue el rol dinámico "Elite" automáticamente cuando el algoritmo de Ranking te posicione arriba.
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Footer Modal */}
                  <div className="p-4 md:p-6 bg-surface-container-lowest border-t border-outline-variant/10 flex justify-end">
                     <button onClick={() => setIsHelpModalOpen(false)} className="px-10 py-3.5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        ¡Entendido, let&apos;s build!
                     </button>
                  </div>
               </div>
            </div>
          )}

          {showUpgradeModal && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-surface rounded-3xl max-w-sm w-full p-8 shadow-2xl relative border border-outline-variant/20 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                   <button 
                     onClick={() => setShowUpgradeModal(false)}
                     className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant border border-outline-variant/10"
                   >
                      <span className="material-symbols-outlined text-sm">close</span>
                   </button>
                   <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                   </div>
                   <h3 className="text-xl font-bold text-on-surface mb-2">Exclusivo Plan ELITE</h3>
                   <p className="text-sm font-medium text-on-surface-variant mb-6 leading-relaxed">
                     La creación y vinculación de eventos está reservada para creadores en el plan Elite. Actualiza ahora para crear eventos web o presenciales sin límites.
                   </p>
                   <button onClick={() => setShowUpgradeModal(false)} className="w-full bg-amber-500 text-amber-950 font-black px-6 py-3 rounded-xl shadow-md uppercase tracking-widest text-sm hover:scale-105 transition-transform active:scale-95 leading-tight flex justify-center items-center gap-2">
                      Conseguir Elite
                   </button>
                </div>
             </div>
          )}
        </>
        )}
      </main>
      <BottomNavBar />
    </>
  );
}
