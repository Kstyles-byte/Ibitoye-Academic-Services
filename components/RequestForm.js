const submitData = async (formData) => {
  try {
    setIsSubmitting(true);
    
    // Generate a unique ID for the request
    const requestId = generateRequestId();
    
    // Add the requestId to the form data
    const dataWithId = {
      ...formData,
      requestId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    // Submit the request to Firestore
    const docRef = await addDoc(collection(db, "requests"), dataWithId);
    console.log("Document written with ID: ", docRef.id);
    
    // Send confirmation email to client
    try {
      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: 'requestConfirmation',
          to: formData.email,
          clientName: formData.name,
          requestTitle: formData.title,
          requestId
        })
      });
      
      if (!emailRes.ok) {
        const errorData = await emailRes.json();
        console.error('Error sending client confirmation email:', errorData);
      }
    } catch (emailError) {
      console.error('Failed to send client email:', emailError);
      // Continue with the submission even if email fails
    }
    
    // Send notification email to admin
    try {
      const adminEmailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: 'adminNotification',
          to: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@academiclessons.com',
          clientName: formData.name,
          requestTitle: formData.title,
          requestId,
          academicLevel: formData.academicLevel,
          deadline: formData.deadline,
          adminDashboardUrl: `${window.location.origin}/admin/requests/${docRef.id}`
        })
      });
      
      if (!adminEmailRes.ok) {
        const errorData = await adminEmailRes.json();
        console.error('Error sending admin notification email:', errorData);
      }
    } catch (adminEmailError) {
      console.error('Failed to send admin email:', adminEmailError);
      // Continue with the submission even if email fails
    }
    
    // Reset the form and show success message
    setIsSuccessful(true);
    formik.resetForm();
    setIsSubmitting(false);
    
  } catch (error) {
    console.error("Error adding document: ", error);
    setIsSubmitting(false);
    alert('An error occurred. Please try again later.');
  }
}; 