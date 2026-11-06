/* Modifica password dell'utente già autenticato: nessuna email, nessuna password in URL o storage. */
(function(){
  "use strict";
  function el(tag, props={}) {
    const node=document.createElement(tag);
    for(const [k,v] of Object.entries(props)){
      if(k==="textContent") node.textContent=v;
      else if(k==="className") node.className=v;
      else if(k==="type") node.type=v;
      else if(k==="autocomplete") node.autocomplete=v;
      else node.setAttribute(k,v);
    }
    return node;
  }
  function openChangePassword(){
    const overlay=el("div");
    overlay.style.cssText="position:fixed;inset:0;z-index:22000;background:#001b31bb;display:flex;align-items:center;justify-content:center;padding:16px";
    const dialog=el("section",{role:"dialog","aria-modal":"true","aria-label":"Cambia password"});
    dialog.style.cssText="width:min(420px,100%);max-height:94dvh;overflow:auto;background:#fff;border-radius:16px;padding:26px;color:#143545;box-shadow:0 20px 50px #0004";
    const title=el("h2",{textContent:"Cambia password"});
    title.style.cssText="font:700 23px system-ui;margin:0 0 10px";
    const intro=el("p",{textContent:"Sei già autenticato. La nuova password sarà valida anche per RA e UMTE Manager. Non è necessario ricevere email."});
    intro.style.cssText="font:14px/1.5 system-ui;margin:0 0 14px;color:#476775";
    const form=el("form",{method:"post",action:"#"});
    form.autocomplete="off";
    function field(labelText){
      const label=el("label",{textContent:labelText});
      label.style.cssText="display:block;margin:12px 0 5px;font:600 14px system-ui";
      const input=el("input",{type:"password",autocomplete:"new-password",required:"",minlength:"14"});
      input.style.cssText="width:100%;box-sizing:border-box;font:16px system-ui;border:1px solid #a2bdc7;border-radius:8px;padding:12px;background:white;color:#153847";
      form.append(label,input);
      return input;
    }
    const first=field("Nuova password (almeno 14 caratteri)");
    const second=field("Ripeti nuova password");
    const msg=el("p",{role:"status","aria-live":"polite"});
    msg.style.cssText="font:13px/1.4 system-ui;color:#b4282c;min-height:22px";
    const controls=el("div");
    controls.style.cssText="display:flex;gap:9px";
    const cancel=el("button",{type:"button",textContent:"Annulla"});
    const submit=el("button",{type:"submit",textContent:"Aggiorna password"});
    for(const b of [cancel,submit])b.style.cssText="flex:1;min-height:43px;border:0;border-radius:8px;font:600 14px system-ui;cursor:pointer";
    cancel.style.background="#eaf1f3";cancel.style.color="#143545";
    submit.style.background="#123c53";submit.style.color="white";
    const close=()=>{first.value="";second.value="";overlay.remove();};
    cancel.onclick=close;
    overlay.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
    form.addEventListener("submit",async e=>{
      e.preventDefault();
      const pw=first.value;
      if(pw.length<14){msg.textContent="La password deve contenere almeno 14 caratteri.";return;}
      if(pw!==second.value){msg.textContent="Le due password non coincidono.";return;}
      submit.disabled=true;
      msg.textContent="Aggiornamento in corso…";
      try{
        // Usa esclusivamente il token Supabase dell'utente già autenticato.
        // Nessuna password viene salvata, registrata o inserita negli URL.
        await cloudFetch("/auth/v1/user",{
          method:"PUT",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({password:pw})
        });
        first.value="";second.value="";
        msg.textContent="Password aggiornata. Ora effettua nuovamente l'accesso.";
        msg.style.color="#216b4a";
        alert("Password aggiornata correttamente. Accedi di nuovo con la nuova password.");
        close();
        await cloudLogout();
      }catch(err){
        first.value="";second.value="";
        msg.textContent="Modifica non riuscita: "+(err?.message||"Riprova dopo esserti autenticato nuovamente.");
      }finally{submit.disabled=false;}
    });
    controls.append(cancel,submit);
    form.append(msg,controls);
    dialog.append(title,intro,form);
    overlay.append(dialog);
    document.body.append(overlay);
    first.focus();
  }
  function addButton(container){
    if(!container)return;
    const button=el("button",{type:"button",textContent:"CAMBIA PASSWORD"});
    button.className="account-change-password";
    button.style.cssText="margin:0 6px;min-height:36px;border:1px solid #9bb9c8;border-radius:8px;padding:6px 9px;background:#eff5f7;color:#12344b;font:600 12px system-ui;cursor:pointer";
    button.addEventListener("click",openChangePassword);
    container.append(button);
  }
  const setup=()=>{
    addButton(document.querySelector("header .cloud-user"));
    // Anche sui telefoni l'azione rimane disponibile dopo l'accesso.
    addButton(document.querySelector(".mobile-admin-quick"));
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});
  else setup();
})();
