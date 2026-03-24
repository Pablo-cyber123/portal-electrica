import Link from 'next/link';
import { MapPin, Phone, Mail, BookOpen, FileText, Download, GraduationCap, ChevronRight, Zap } from 'lucide-react';
import { RadioPlayer } from './RadioPlayer';

export function Footer() {
  return (
    <footer className="bg-oxfordGrey-900 pt-20 pb-10 border-t-8 border-utsGreen-500 text-oxfordGrey-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Col 1: Brand & Contact */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-utsGreen-500 p-2 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white leading-none tracking-tight">UTS</h3>
                <h4 className="text-utsGreen-400 font-bold leading-none tracking-tight">ELÉCTRICA</h4>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed text-oxfordGrey-400 mt-2">
              Coordinación del Programa de Ingeniería Eléctrica. Formando profesionales con excelencia académica e innovación tecnológica.
            </p>

            <div className="space-y-3 mt-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-utsGreen-500 shrink-0 mt-0.5" />
                <span className="text-sm">Oficina de Coordinación: Edificio A, Piso 2<br/>Sede Principal Bucaramanga<br/>Calle de los Estudiantes #9-82</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-utsGreen-500 shrink-0" />
                <span className="text-sm">PBX: (+57) 607 6917700 Ext: 1205<br/>Línea gratuita: 01 8000 940 203</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-utsGreen-500 shrink-0" />
                <a href="mailto:coordinacionelectrica@correo.uts.edu.co" className="text-sm hover:text-white transition-colors">coordinacionelectrica@correo.uts.edu.co</a>
              </div>
            </div>
          </div>

          {/* Col 2: Enlaces Rápidos */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-utsGreen-500" /> Accesos Rápidos
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm hover:text-utsGreen-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-oxfordGrey-700" />
                  Inicio Portal Eléctrica
                </Link>
              </li>
              <li>
                <Link href="/noticias" className="text-sm hover:text-utsGreen-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-oxfordGrey-700" />
                  Portal de Noticias
                </Link>
              </li>
              <li>
                <Link href="/semillero-age" className="text-sm hover:text-utsGreen-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-oxfordGrey-700" />
                  Semillero AGE
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm hover:text-utsGreen-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-oxfordGrey-700" />
                  Acceso Docentes/Estudiantes
                </Link>
              </li>
              <li>
                <a href="https://www.uts.edu.co/" target="_blank" rel="noreferrer" className="text-sm hover:text-utsGreen-400 transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-oxfordGrey-700" />
                  Portal Principal UTS
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Base Documental Estudiantes */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-utsGreen-500" /> Base Documental
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/documentos" className="group flex items-start gap-3 p-3 rounded-xl hover:bg-oxfordGrey-800 transition-all border border-transparent hover:border-oxfordGrey-700">
                  <FileText className="w-5 h-5 text-oxfordGrey-400 group-hover:text-utsGreen-400 shrink-0" />
                  <div>
                    <span className="block text-sm font-medium text-oxfordGrey-200 group-hover:text-white transition-colors">Reglamento Estudiantil</span>
                    <span className="text-xs text-oxfordGrey-500">Normativa y derechos</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/documentos" className="group flex items-start gap-3 p-3 rounded-xl hover:bg-oxfordGrey-800 transition-all border border-transparent hover:border-oxfordGrey-700">
                  <Download className="w-5 h-5 text-oxfordGrey-400 group-hover:text-utsGreen-400 shrink-0" />
                  <div>
                    <span className="block text-sm font-medium text-oxfordGrey-200 group-hover:text-white transition-colors">Plan de Estudios</span>
                    <span className="text-xs text-oxfordGrey-500">Malla curricular actualizada</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/documentos" className="group flex items-start gap-3 p-3 rounded-xl hover:bg-oxfordGrey-800 transition-all border border-transparent hover:border-oxfordGrey-700">
                  <GraduationCap className="w-5 h-5 text-oxfordGrey-400 group-hover:text-utsGreen-400 shrink-0" />
                  <div>
                    <span className="block text-sm font-medium text-oxfordGrey-200 group-hover:text-white transition-colors">Opciones de Grado</span>
                    <span className="text-xs text-oxfordGrey-500">Modalidades y requisitos</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Radio Tu Radio UTS */}
          <div className="flex flex-col">
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              Sintoniza UTS
            </h4>
            <p className="text-sm text-oxfordGrey-400 mb-6">
              Escucha Tu Radio UTS, la emisora institucional con la mejor programación universitaria.
            </p>
            <div className="mt-auto">
              <RadioPlayer />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-oxfordGrey-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-oxfordGrey-500 text-center md:text-left">
            © {new Date().getFullYear()} Unidades Tecnológicas de Santander. Institución de Educación Superior sujeta a inspección y vigilancia por el Ministerio de Educación Nacional.
          </p>
          <div className="flex items-center gap-4 text-xs text-oxfordGrey-500 font-medium">
            <a href="#" className="hover:text-utsGreen-400 transition-colors">Políticas de Privacidad</a>
            <div className="w-1 h-1 rounded-full bg-oxfordGrey-600" />
            <a href="#" className="hover:text-utsGreen-400 transition-colors">Términos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
